use anyhow::Result;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use redis::aio::ConnectionManager;
use sqlx::{PgPool, Postgres, Transaction};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::config::Config;
use crate::realtime::hub::WsHub;

pub type DbTxn<'a> = Transaction<'a, Postgres>;

pub struct AppState {
    pub db: PgPool,
    pub redis: ConnectionManager,
    pub config: Config,
    pub ws_hub: Arc<WsHub>,
    pub http: reqwest::Client,
}

async fn sync_edustatus_app_password(admin: &PgPool, password: &str) -> Result<()> {
    let escaped = password.replace('\'', "''");
    let sql = format!("ALTER ROLE edustatus_app PASSWORD '{escaped}'");
    sqlx::query(&sql).execute(admin).await?;
    tracing::info!("edustatus_app password synchronized from EDUSTATUS_APP_PASSWORD");
    Ok(())
}

impl AppState {
    pub async fn new(cfg: &Config) -> Result<Self> {
        if let Some(ref admin_url) = cfg.migrate_database_url {
            let admin = sqlx::postgres::PgPoolOptions::new()
                .max_connections(2)
                .min_connections(1)
                .acquire_timeout(std::time::Duration::from_secs(30))
                .connect(admin_url)
                .await
                .map_err(|e| anyhow::anyhow!("MIGRATE_DATABASE_URL: {}", e))?;

            sqlx::migrate!("./migrations")
                .run(&admin)
                .await
                .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;
            tracing::info!("Database migrations applied (via MIGRATE_DATABASE_URL)");

            if let Some(ref pw) = cfg.edustatus_app_password {
                sync_edustatus_app_password(&admin, pw).await?;
            } else {
                tracing::warn!(
                    "MIGRATE_DATABASE_URL set but EDUSTATUS_APP_PASSWORD unset — ensure DATABASE_URL matches the edustatus_app password (see migration 0003 default or prior ALTER ROLE)"
                );
            }

            admin.close().await;
        }

        let db = sqlx::postgres::PgPoolOptions::new()
            .max_connections(20)
            .min_connections(2)
            .acquire_timeout(std::time::Duration::from_secs(10))
            .idle_timeout(std::time::Duration::from_secs(600))
            .max_lifetime(std::time::Duration::from_secs(3600))
            .connect(&cfg.database_url)
            .await?;

        tracing::info!("PostgreSQL connected (application pool)");

        if cfg.migrate_database_url.is_none() {
            sqlx::migrate!("./migrations")
                .run(&db)
                .await
                .map_err(|e| anyhow::anyhow!("Migration failed: {}", e))?;
            tracing::info!("Database migrations applied (same as DATABASE_URL — superuser bypasses RLS)");
        }

        if cfg.data_plane == crate::config::DataPlaneMode::Distributed {
            tracing::info!(
                "DATA_PLANE=distributed: align organizations.shard_region/shard_instance with shard-manager; route writes via query-router when integrated"
            );
            if cfg.shard_manager_url.is_none() {
                tracing::warn!("SHARD_MANAGER_URL unset — distributed health checks will mark shard-manager not_configured");
            }
        }

        seed_super_admin(&db, &cfg.super_admin_email, &cfg.super_admin_password).await?;

        let redis_client = redis::Client::open(cfg.redis_url.clone())?;
        let redis = ConnectionManager::new(redis_client).await?;

        tracing::info!("Redis connected");

        let http = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .pool_max_idle_per_host(10)
            .build()?;

        let ws_hub = Arc::new(WsHub::new());

        Ok(Self {
            db,
            redis,
            config: cfg.clone(),
            ws_hub,
            http,
        })
    }

    /// Begin a DB transaction with RLS session variables (for `edustatus_app`).
    pub async fn begin_tenant_transaction(
        &self,
        skip_tenant_rls: bool,
        current_org_id: Option<Uuid>,
    ) -> Result<DbTxn<'_>, sqlx::Error> {
        let mut tx = self.db.begin().await?;
        crate::tenancy::set_tenant_session(&mut tx, skip_tenant_rls, current_org_id).await?;
        Ok(tx)
    }

    /// RLS bypass for auth, migrations, internal hooks, and background jobs.
    pub async fn begin_skip_rls_transaction(&self) -> Result<DbTxn<'_>, sqlx::Error> {
        self.begin_tenant_transaction(true, None).await
    }

    /// Tenant-scoped transaction for authenticated API handlers (`app.current_org_id` / `app.skip_tenant_rls`).
    pub async fn tenant_tx_for(&self, user: &UserProfile) -> Result<DbTxn<'_>, sqlx::Error> {
        self.begin_tenant_transaction(user.rls_skip(), user.rls_org_id())
            .await
    }
}

async fn seed_super_admin(db: &PgPool, email: &str, password: &str) -> Result<()> {
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM users WHERE role = 'super_admin')",
    )
    .fetch_one(db)
    .await?;

    if exists {
        tracing::info!("Super admin already exists, skipping seed");
        return Ok(());
    }

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("Password hashing failed: {}", e))?
        .to_string();

    sqlx::query(
        "INSERT INTO users (email, password_hash, full_name, role, is_active, is_verified)
         VALUES ($1, $2, 'Super Admin', 'super_admin', true, true)",
    )
    .bind(email)
    .bind(&password_hash)
    .execute(db)
    .await?;

    tracing::info!("Super admin created: {}", email);
    Ok(())
}
