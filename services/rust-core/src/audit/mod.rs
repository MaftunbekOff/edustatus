pub mod models;

use axum::{
    extract::{Extension, Query, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::errors::AppResult;
use crate::state::AppState;
pub use models::AuditLog;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new().route("/", get(list_audit))
}

#[derive(Debug, Deserialize)]
struct AuditQuery {
    org_id: Option<Uuid>,
    user_id: Option<Uuid>,
    entity: Option<String>,
    action: Option<String>,
    page: Option<i64>,
    limit: Option<i64>,
}

async fn list_audit(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<AuditQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(50).clamp(1, 200);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, AuditLog>(
        "SELECT * FROM audit_logs
         WHERE ($1::uuid IS NULL OR org_id   = $1)
           AND ($2::uuid IS NULL OR user_id  = $2)
           AND ($3::text IS NULL OR entity   = $3)
           AND ($4::text IS NULL OR action   = $4)
         ORDER BY created_at DESC LIMIT $5 OFFSET $6",
    )
    .bind(q.org_id)
    .bind(q.user_id)
    .bind(&q.entity)
    .bind(&q.action)
    .bind(limit)
    .bind((page - 1) * limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({ "data": rows, "page": page, "limit": limit })))
}

/// Fire-and-forget audit row (RLS bypass — internal / system logging).
pub async fn log(
    state: &AppState,
    org_id: Option<Uuid>,
    user_id: Option<Uuid>,
    action: &str,
    entity: &str,
    entity_id: Option<Uuid>,
    old_value: Option<&serde_json::Value>,
    new_value: Option<&serde_json::Value>,
    ip: Option<&str>,
) {
    if let Ok(mut tx) = state.begin_skip_rls_transaction().await {
        let _ = sqlx::query(
            "INSERT INTO audit_logs
                (id, org_id, user_id, action, entity, entity_id, old_value, new_value, ip_address)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        )
        .bind(Uuid::new_v4())
        .bind(org_id)
        .bind(user_id)
        .bind(action)
        .bind(entity)
        .bind(entity_id)
        .bind(old_value)
        .bind(new_value)
        .bind(ip)
        .execute(&mut *tx)
        .await;
        let _ = tx.commit().await;
    }
}
