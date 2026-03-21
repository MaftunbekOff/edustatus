//! Transaction-scoped PostgreSQL settings for Row Level Security (`0003_rls_tenant.sql`).
//!
//! When connecting as `edustatus_app`, run tenant work inside one transaction:
//! 1. `begin`
//! 2. [`set_tenant_session`] — `set_config(..., true)` is **transaction-local**
//! 3. queries on `&mut *tx`
//! 4. `commit` / `rollback`
//!
//! The `postgres` superuser **bypasses RLS**. Use `DATABASE_URL` with role `edustatus_app`
//! (see `MIGRATE_DATABASE_URL` + `EDUSTATUS_APP_PASSWORD` in docker-compose / `.env.example`) so policies apply.

use sqlx::{Postgres, Transaction};
use uuid::Uuid;

pub async fn set_tenant_session(
    tx: &mut Transaction<'_, Postgres>,
    skip_tenant_rls: bool,
    current_org_id: Option<Uuid>,
) -> Result<(), sqlx::Error> {
    let skip = if skip_tenant_rls { "true" } else { "false" };
    sqlx::query("SELECT set_config('app.skip_tenant_rls', $1, true)")
        .bind(skip)
        .execute(&mut **tx)
        .await?;

    let oid = current_org_id.map(|u| u.to_string()).unwrap_or_default();
    sqlx::query("SELECT set_config('app.current_org_id', $1, true)")
        .bind(&oid)
        .execute(&mut **tx)
        .await?;

    Ok(())
}
