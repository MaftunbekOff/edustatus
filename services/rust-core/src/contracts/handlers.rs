use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::contracts::models::*;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ContractListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 100);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Contract>(
        "SELECT * FROM contracts
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND ($2::uuid IS NULL OR client_id = $2)
           AND ($3::text IS NULL OR status = $3)
         ORDER BY contract_date DESC LIMIT $4 OFFSET $5",
    )
    .bind(q.org_id)
    .bind(q.client_id)
    .bind(&q.status)
    .bind(limit)
    .bind((page - 1) * limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

pub async fn get(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Contract>("SELECT * FROM contracts WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Contract not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateContractRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;

    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM contracts WHERE contract_number = $1)",
    )
    .bind(&body.contract_number)
    .fetch_one(&mut *tx)
    .await?;
    if exists {
        return Err(AppError::Conflict(format!(
            "Contract number {} already exists",
            body.contract_number
        )));
    }

    let row = sqlx::query_as::<_, Contract>(
        "INSERT INTO contracts
            (id, org_id, client_id, contract_number, contract_date, start_date,
             end_date, amount, payment_schedule, document_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(body.org_id)
    .bind(body.client_id)
    .bind(&body.contract_number)
    .bind(body.contract_date)
    .bind(body.start_date)
    .bind(body.end_date)
    .bind(body.amount)
    .bind(&body.payment_schedule)
    .bind(&body.document_url)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query(
        "UPDATE clients SET total_amount = total_amount + $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(body.amount)
    .bind(body.client_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(Json(json!({ "data": row })))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateContractRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Contract>(
        "UPDATE contracts SET
            end_date         = COALESCE($1, end_date),
            amount           = COALESCE($2, amount),
            payment_schedule = COALESCE($3, payment_schedule),
            document_url     = COALESCE($4, document_url),
            status           = COALESCE($5, status),
            updated_at       = NOW()
         WHERE id = $6 RETURNING *",
    )
    .bind(body.end_date)
    .bind(body.amount)
    .bind(&body.payment_schedule)
    .bind(&body.document_url)
    .bind(&body.status)
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Contract not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn cancel(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Contract>(
        "UPDATE contracts SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND status = 'active' RETURNING *",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Contract cannot be cancelled".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}
