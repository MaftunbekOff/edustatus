use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::bank_records::models::*;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<BankRecordListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 200);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, BankRecord>(
        "SELECT * FROM bank_records
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND ($2::text IS NULL OR status = $2)
         ORDER BY transaction_date DESC LIMIT $3 OFFSET $4",
    )
    .bind(q.org_id)
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
    let row = sqlx::query_as::<_, BankRecord>("SELECT * FROM bank_records WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Bank record not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn import(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<ImportBankRecordRequest>,
) -> AppResult<Json<Value>> {
    let mut imported = 0usize;
    let mut skipped = 0usize;

    let mut tx = state.tenant_tx_for(&user).await?;

    for rec in &body.records {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM bank_records WHERE transaction_id = $1)",
        )
        .bind(&rec.transaction_id)
        .fetch_one(&mut *tx)
        .await?;

        if exists {
            skipped += 1;
            continue;
        }

        sqlx::query(
            "INSERT INTO bank_records
                (id, org_id, transaction_id, amount, currency, sender_account, sender_name,
                 sender_mfo, receiver_account, receiver_mfo, purpose, transaction_date, imported_from)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
        )
        .bind(Uuid::new_v4())
        .bind(body.org_id)
        .bind(&rec.transaction_id)
        .bind(rec.amount)
        .bind(rec.currency.as_deref().unwrap_or("UZS"))
        .bind(&rec.sender_account)
        .bind(&rec.sender_name)
        .bind(&rec.sender_mfo)
        .bind(&rec.receiver_account)
        .bind(&rec.receiver_mfo)
        .bind(&rec.purpose)
        .bind(rec.transaction_date)
        .bind(&rec.imported_from)
        .execute(&mut *tx)
        .await?;

        imported += 1;
    }

    tx.commit().await?;

    Ok(Json(json!({ "imported": imported, "skipped": skipped })))
}

pub async fn match_payment(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<MatchPaymentRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;

    let rows = sqlx::query(
        "UPDATE bank_records SET status = 'matched', matched_with = $1, matched_at = NOW(), updated_at = NOW()
         WHERE id = $2 AND status = 'new'",
    )
    .bind(body.payment_id)
    .bind(id)
    .execute(&mut *tx)
    .await?;

    if rows.rows_affected() == 0 {
        return Err(AppError::Conflict(
            "Record already matched or not found".into(),
        ));
    }

    sqlx::query(
        "UPDATE payments SET reconciled = true, reconciled_at = NOW(),
         reconciled_with = $1::text, status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
         WHERE id = $2",
    )
    .bind(id.to_string())
    .bind(body.payment_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(Json(json!({ "message": "Matched successfully" })))
}

pub async fn ignore(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    sqlx::query(
        "UPDATE bank_records SET status = 'ignored', updated_at = NOW()
         WHERE id = $1 AND status = 'new'",
    )
    .bind(id)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "Ignored" })))
}

pub async fn auto_reconcile(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<serde_json::Value>,
) -> AppResult<Json<Value>> {
    let org_id: Uuid = body["org_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or_else(|| AppError::Validation("org_id required".into()))?;

    let mut tx = state.tenant_tx_for(&user).await?;
    let matched: i64 = sqlx::query(
        "WITH matches AS (
            SELECT br.id AS br_id, p.id AS p_id
            FROM bank_records br
            JOIN payments p ON p.org_id = br.org_id
                            AND p.amount = br.amount
                            AND ABS(EXTRACT(EPOCH FROM (br.transaction_date - p.payment_date))) < 86400
                            AND p.reconciled = false
                            AND p.status = 'pending'
            WHERE br.org_id = $1 AND br.status = 'new'
        )
        UPDATE bank_records SET status = 'matched', matched_at = NOW(), updated_at = NOW(),
               matched_with = (SELECT p_id FROM matches WHERE br_id = bank_records.id LIMIT 1)
        WHERE id IN (SELECT br_id FROM matches)",
    )
    .bind(org_id)
    .execute(&mut *tx)
    .await
    .map(|r| r.rows_affected() as i64)?;
    tx.commit().await?;

    Ok(Json(json!({ "auto_matched": matched })))
}

pub async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(org_id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, (Option<i64>, Option<i64>, Option<i64>, Option<i64>)>(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'new'),
            COUNT(*) FILTER (WHERE status = 'matched'),
            COUNT(*) FILTER (WHERE status = 'unmatched'),
            COALESCE(SUM(amount) FILTER (WHERE status = 'new'), 0)
         FROM bank_records WHERE org_id = $1",
    )
    .bind(org_id)
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({
        "data": {
            "new": row.0, "matched": row.1,
            "unmatched": row.2, "unmatched_amount_tiyin": row.3
        }
    })))
}
