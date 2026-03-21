use axum::{
    extract::{Extension, Path, Query, State},
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::billing::models::Payment;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list).post(create))
        .route("/stats", get(stats))
        .route("/{id}", get(get_one))
        .route("/{id}/confirm", post(confirm))
        .route("/{id}/reject", post(reject))
}

#[derive(Debug, Deserialize)]
struct PaymentListQuery {
    #[serde(rename = "organizationId")]
    organization_id: Option<Uuid>,
    #[serde(rename = "clientId")]
    client_id: Option<Uuid>,
    status: Option<String>,
    page: Option<i64>,
    limit: Option<i64>,
}

async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<PaymentListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 200);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Payment>(
        "SELECT * FROM payments
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND ($2::uuid IS NULL OR client_id = $2)
           AND ($3::text IS NULL OR status = $3)
         ORDER BY payment_date DESC LIMIT $4 OFFSET $5",
    )
    .bind(q.organization_id)
    .bind(q.client_id)
    .bind(&q.status)
    .bind(limit)
    .bind((page - 1) * limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

async fn get_one(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Payment>("SELECT * FROM payments WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Payment not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

#[derive(Debug, Deserialize)]
struct CreatePaymentRequest {
    #[serde(rename = "organizationId")]
    organization_id: Uuid,
    #[serde(rename = "clientId")]
    client_id: Uuid,
    amount: i64,
    #[serde(rename = "paymentMethod")]
    payment_method: String,
    #[serde(rename = "paymentDate")]
    payment_date: Option<chrono::DateTime<chrono::Utc>>,
    description: Option<String>,
    category: Option<String>,
    #[serde(rename = "referenceNumber")]
    reference_number: Option<String>,
}

async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreatePaymentRequest>,
) -> AppResult<Json<Value>> {
    if body.amount <= 0 {
        return Err(AppError::Validation("Amount must be positive".into()));
    }
    let payment_date = body.payment_date.unwrap_or_else(chrono::Utc::now);

    let mut tx = state.tenant_tx_for(&user).await?;

    let row = sqlx::query_as::<_, Payment>(
        "INSERT INTO payments
            (id, org_id, client_id, amount, payment_method, status, payment_date,
             description, category, reference_number)
         VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,$9) RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(body.organization_id)
    .bind(body.client_id)
    .bind(body.amount)
    .bind(&body.payment_method)
    .bind(payment_date)
    .bind(&body.description)
    .bind(&body.category)
    .bind(&body.reference_number)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query(
        "UPDATE clients SET paid_amount = paid_amount + $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(body.amount)
    .bind(body.client_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

async fn confirm(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Payment>(
        "UPDATE payments SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND status = 'pending' RETURNING *",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Payment is not pending or not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

async fn reject(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;

    let row = sqlx::query_as::<_, Payment>(
        "UPDATE payments SET status = 'rejected', updated_at = NOW()
         WHERE id = $1 AND status = 'pending' RETURNING *",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Payment is not pending or not found".into()))?;

    sqlx::query(
        "UPDATE clients SET paid_amount = GREATEST(paid_amount - $1, 0), updated_at = NOW()
         WHERE id = $2",
    )
    .bind(row.amount)
    .bind(row.client_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<PaymentListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, (Option<i64>, Option<i64>, Option<i64>, Option<i64>)>(
        "SELECT
            COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0)::bigint,
            COUNT(*) FILTER (WHERE status = 'confirmed')::bigint,
            COUNT(*) FILTER (WHERE status = 'pending')::bigint,
            COUNT(*) FILTER (WHERE status = 'rejected')::bigint
         FROM payments
         WHERE ($1::uuid IS NULL OR org_id = $1)",
    )
    .bind(q.organization_id)
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({
        "data": {
            "confirmedAmount": row.0,
            "confirmedCount": row.1,
            "pendingCount": row.2,
            "rejectedCount": row.3
        }
    })))
}
