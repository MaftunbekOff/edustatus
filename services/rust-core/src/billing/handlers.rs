use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::auth::models::UserProfile;
use crate::billing::{engine, models::{CreateInvoiceRequest, CreateSubscriptionRequest, ListQuery}};
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
struct BillingStats {
    total_revenue: Option<i64>,
    pending_amount: Option<i64>,
    overdue_count: Option<i64>,
    paid_this_month: Option<i64>,
}

pub async fn list_invoices(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut tx = state.tenant_tx_for(&user).await?;
    let invoices = sqlx::query_as::<_, crate::billing::models::Invoice>(
        "SELECT * FROM invoices
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND ($2::text IS NULL OR status = $2::invoice_status)
         ORDER BY created_at DESC LIMIT $3 OFFSET $4",
    )
    .bind(q.org_id)
    .bind(&q.status)
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({ "data": invoices, "page": page, "limit": limit })))
}

pub async fn get_invoice(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let invoice = engine::get_invoice_by_id(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": invoice })))
}

pub async fn create_invoice(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateInvoiceRequest>,
) -> AppResult<Json<Value>> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let invoice = engine::create_invoice(&mut tx, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": invoice })))
}

pub async fn update_invoice(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let invoice = sqlx::query_as::<_, crate::billing::models::Invoice>(
        "UPDATE invoices SET description = COALESCE($1, description), updated_at = NOW()
         WHERE id = $2 AND status = 'draft'::invoice_status RETURNING *",
    )
    .bind(body.get("description").and_then(|v| v.as_str()))
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Only draft invoices can be edited".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": invoice })))
}

pub async fn pay_invoice(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<Value>> {
    let provider = body
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("manual")
        .to_string();
    let provider_id = body
        .get("provider_payment_id")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let mut tx = state.tenant_tx_for(&user).await?;
    let payment = engine::pay_invoice(&mut tx, id, &provider, provider_id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": payment })))
}

pub async fn cancel_invoice(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let invoice = engine::cancel_invoice(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": invoice })))
}

pub async fn list_subscriptions(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let subs = sqlx::query_as::<_, crate::billing::models::Subscription>(
        "SELECT * FROM subscriptions
         WHERE ($1::uuid IS NULL OR org_id = $1)
         ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    )
    .bind(q.org_id)
    .bind(q.limit.unwrap_or(20))
    .bind((q.page.unwrap_or(1) - 1) * q.limit.unwrap_or(20))
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": subs })))
}

pub async fn get_subscription(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let sub = sqlx::query_as::<_, crate::billing::models::Subscription>(
        "SELECT * FROM subscriptions WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Subscription not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": sub })))
}

pub async fn create_subscription(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateSubscriptionRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let sub = engine::create_subscription(&mut tx, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": sub })))
}

pub async fn cancel_subscription(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let sub = engine::cancel_subscription(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": sub })))
}

pub async fn list_payments(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let payments = sqlx::query_as::<_, crate::billing::models::BillingPayment>(
        "SELECT * FROM billing_payments WHERE ($1::uuid IS NULL OR org_id = $1)
         ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    )
    .bind(q.org_id)
    .bind(q.limit.unwrap_or(20))
    .bind((q.page.unwrap_or(1) - 1) * q.limit.unwrap_or(20))
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": payments })))
}

pub async fn get_payment(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let payment = sqlx::query_as::<_, crate::billing::models::BillingPayment>(
        "SELECT * FROM billing_payments WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Payment not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": payment })))
}

pub async fn billing_stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let stats = sqlx::query_as::<_, BillingStats>(
        "SELECT
            COALESCE(SUM(total_tiyin) FILTER (WHERE status = 'paid'::invoice_status), 0)      AS total_revenue,
            COALESCE(SUM(total_tiyin) FILTER (WHERE status = 'pending'::invoice_status), 0)   AS pending_amount,
            COUNT(*) FILTER (WHERE status = 'overdue'::invoice_status)                        AS overdue_count,
            COUNT(*) FILTER (WHERE status = 'paid'::invoice_status
                               AND paid_at > NOW() - INTERVAL '30 days')                      AS paid_this_month
         FROM invoices",
    )
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({
        "data": {
            "total_revenue_tiyin": stats.total_revenue,
            "pending_tiyin":       stats.pending_amount,
            "overdue_invoices":    stats.overdue_count,
            "paid_this_month":     stats.paid_this_month
        }
    })))
}

pub async fn revenue_report(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<std::collections::HashMap<String, String>>,
) -> AppResult<Json<Value>> {
    let days: i32 = q.get("days").and_then(|d| d.parse().ok()).unwrap_or(30);
    let org_id: Option<Uuid> = q.get("org_id").and_then(|id| id.parse().ok());
    let mut tx = state.tenant_tx_for(&user).await?;
    let data = engine::revenue_by_period(&mut tx, org_id, days).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": data })))
}
