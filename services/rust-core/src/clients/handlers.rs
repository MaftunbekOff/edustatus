use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::auth::models::UserProfile;
use crate::clients::{models::*, service};
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ClientListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let (clients, total) = service::list(&mut tx, &q).await?;
    tx.commit().await?;
    Ok(Json(json!({
        "data": clients,
        "pagination": { "page": q.page.unwrap_or(1), "limit": q.limit.unwrap_or(20), "total": total }
    })))
}

pub async fn get(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let client = service::get(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": client })))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateClientRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let client = service::create(&mut tx, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": client })))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateClientRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let client = service::update(&mut tx, id, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": client })))
}

pub async fn delete(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::delete(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "Client deleted" })))
}

pub async fn record_payment(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<RecordPaymentRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let result = service::record_payment(&mut tx, id, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": result })))
}

pub async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(org_id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let data = service::client_stats(&mut tx, org_id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": data })))
}

/// GET /api/clients/debtors?organizationId=...
pub async fn debtors(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ClientListQuery>,
) -> AppResult<Json<Value>> {
    let limit: i64 = q.limit.unwrap_or(100).clamp(1, 500);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, ClientSummary>(
        "SELECT
            c.id, c.org_id, c.full_name, c.phone, c.pinfl, c.status,
            c.total_amount, c.paid_amount, c.debt_amount,
            d.name AS department_name,
            COUNT(p.id) FILTER (WHERE p.status = 'confirmed')::bigint AS confirmed_payments,
            c.created_at
         FROM clients c
         LEFT JOIN departments d ON d.id = c.dept_id
         LEFT JOIN payments p ON p.client_id = c.id
         WHERE c.debt_amount > 0
           AND ($1::uuid IS NULL OR c.org_id = $1)
           AND c.status != 'archived'
         GROUP BY c.id, d.name
         ORDER BY c.debt_amount DESC
         LIMIT $2",
    )
    .bind(q.org_id)
    .bind(limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

/// GET /api/clients/duplicates?organizationId=...
pub async fn duplicates(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ClientListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, ClientSummary>(
        "SELECT
            c.id, c.org_id, c.full_name, c.phone, c.pinfl, c.status,
            c.total_amount, c.paid_amount, c.debt_amount,
            d.name AS department_name,
            COUNT(p.id) FILTER (WHERE p.status = 'confirmed')::bigint AS confirmed_payments,
            c.created_at
         FROM clients c
         LEFT JOIN departments d ON d.id = c.dept_id
         LEFT JOIN payments p ON p.client_id = c.id
         WHERE ($1::uuid IS NULL OR c.org_id = $1)
           AND c.phone IS NOT NULL
           AND c.phone IN (
               SELECT phone FROM clients
               WHERE ($1::uuid IS NULL OR org_id = $1) AND phone IS NOT NULL
               GROUP BY phone HAVING COUNT(*) > 1
           )
         GROUP BY c.id, d.name
         ORDER BY c.phone, c.created_at",
    )
    .bind(q.org_id)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

pub async fn payment_history(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Query(q): Query<std::collections::HashMap<String, String>>,
) -> AppResult<Json<Value>> {
    let page: i64 = q.get("page").and_then(|v| v.parse().ok()).unwrap_or(1);
    let limit: i64 = q.get("limit").and_then(|v| v.parse().ok()).unwrap_or(20);
    let offset = (page - 1) * limit;

    let mut tx = state.tenant_tx_for(&user).await?;
    let payments = sqlx::query_as::<_, crate::billing::models::Payment>(
        "SELECT * FROM payments WHERE client_id = $1 ORDER BY payment_date DESC LIMIT $2 OFFSET $3",
    )
    .bind(id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({ "data": payments, "page": page, "limit": limit })))
}
