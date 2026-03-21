use anyhow::{Context, Result};

/// `DATA_PLANE=direct` (default): single PostgreSQL via `DATABASE_URL`.
/// `DATA_PLANE=distributed`: expect `shard-manager` + `query-router` in topology; health aggregates their status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum DataPlaneMode {
    #[default]
    Direct,
    Distributed,
}

impl DataPlaneMode {
    fn from_env() -> Self {
        match std::env::var("DATA_PLANE")
            .unwrap_or_default()
            .to_ascii_lowercase()
            .as_str()
        {
            "distributed" | "shard" | "sharded" => Self::Distributed,
            _ => Self::Direct,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    /// Runtime pool (use `edustatus_app` in production so RLS applies).
    pub database_url: String,
    /// When set, migrations + optional `edustatus_app` password sync run against this URL (superuser).
    /// Omit for local dev with a single `postgres` `DATABASE_URL` (RLS bypassed for that role).
    pub migrate_database_url: Option<String>,
    /// If set with `migrate_database_url`, runs `ALTER ROLE edustatus_app PASSWORD ...` after migrate.
    pub edustatus_app_password: Option<String>,
    pub redis_url: String,
    pub jwt_secret: String,
    pub jwt_access_ttl_secs: i64,
    pub jwt_refresh_ttl_secs: i64,
    pub frontend_url: String,
    pub go_connectors_url: String,
    pub query_router_url: String,
    /// When set, used for distributed-plane health checks and ops alignment with `shard-manager`.
    pub shard_manager_url: Option<String>,
    /// First region from `DEFAULT_SHARD_REGION` or first entry in `SHARD_REGIONS` (comma-separated).
    pub default_shard_region: Option<String>,
    /// Default physical shard id within the region (e.g. `00-0000`), from `DEFAULT_SHARD_INSTANCE` or built-in default.
    pub default_shard_instance: Option<String>,
    pub data_plane: DataPlaneMode,
    pub internal_secret: String,
    pub node_env: String,
    pub max_sessions_per_user: i64,
    pub rate_limit_requests: u32,
    pub rate_limit_window_secs: u64,
    pub super_admin_email: String,
    pub super_admin_password: String,
}

fn parse_first_shard_region() -> Option<String> {
    std::env::var("SHARD_REGIONS").ok().and_then(|raw| {
        raw.split(',')
            .next()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
    })
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let default_shard_region = std::env::var("DEFAULT_SHARD_REGION")
            .ok()
            .filter(|s| !s.trim().is_empty())
            .or_else(parse_first_shard_region);

        let default_shard_instance = std::env::var("DEFAULT_SHARD_INSTANCE")
            .ok()
            .filter(|s| !s.trim().is_empty())
            .or_else(|| Some("00-0000".to_string()));

        let migrate_database_url = std::env::var("MIGRATE_DATABASE_URL")
            .ok()
            .filter(|s| !s.trim().is_empty());
        let edustatus_app_password = std::env::var("EDUSTATUS_APP_PASSWORD")
            .ok()
            .filter(|s| !s.is_empty());

        Ok(Self {
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".into())
                .parse()
                .context("PORT must be a valid port number")?,
            database_url: std::env::var("DATABASE_URL")
                .context("DATABASE_URL is required")?,
            migrate_database_url,
            edustatus_app_password,
            redis_url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://redis:6379".into()),
            jwt_secret: std::env::var("JWT_SECRET")
                .context("JWT_SECRET is required")?,
            jwt_access_ttl_secs: std::env::var("JWT_ACCESS_TTL_SECS")
                .unwrap_or_else(|_| "900".into())
                .parse()
                .context("JWT_ACCESS_TTL_SECS must be a number")?,
            jwt_refresh_ttl_secs: std::env::var("JWT_REFRESH_TTL_SECS")
                .unwrap_or_else(|_| "604800".into())
                .parse()
                .context("JWT_REFRESH_TTL_SECS must be a number")?,
            frontend_url: std::env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:3000".into()),
            go_connectors_url: std::env::var("GO_CONNECTORS_URL")
                .unwrap_or_else(|_| "http://go-connectors:8090".into()),
            query_router_url: std::env::var("QUERY_ROUTER_URL")
                .unwrap_or_else(|_| "http://query-router:8082".into()),
            shard_manager_url: std::env::var("SHARD_MANAGER_URL")
                .ok()
                .filter(|s| !s.trim().is_empty()),
            default_shard_region,
            default_shard_instance,
            data_plane: DataPlaneMode::from_env(),
            internal_secret: std::env::var("INTERNAL_SECRET")
                .context("INTERNAL_SECRET is required")?,
            node_env: std::env::var("NODE_ENV")
                .unwrap_or_else(|_| "development".into()),
            max_sessions_per_user: std::env::var("MAX_SESSIONS_PER_USER")
                .unwrap_or_else(|_| "5".into())
                .parse()
                .context("MAX_SESSIONS_PER_USER must be a number")?,
            rate_limit_requests: std::env::var("RATE_LIMIT_REQUESTS")
                .unwrap_or_else(|_| "100".into())
                .parse()
                .context("RATE_LIMIT_REQUESTS must be a number")?,
            rate_limit_window_secs: std::env::var("RATE_LIMIT_WINDOW_SECS")
                .unwrap_or_else(|_| "60".into())
                .parse()
                .context("RATE_LIMIT_WINDOW_SECS must be a number")?,
            super_admin_email: std::env::var("SUPER_ADMIN_EMAIL")
                .context("SUPER_ADMIN_EMAIL is required")?,
            super_admin_password: std::env::var("SUPER_ADMIN_PASSWORD")
                .context("SUPER_ADMIN_PASSWORD is required")?,
        })
    }

    pub fn is_production(&self) -> bool {
        self.node_env == "production"
    }
}
