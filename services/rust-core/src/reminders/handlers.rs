use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::errors::{AppError, AppResult};
use crate::reminders::models::*;
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<ReminderListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 100);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Reminder>(
        "SELECT * FROM reminders
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND ($2::text IS NULL OR status = $2)
         ORDER BY scheduled_at DESC LIMIT $3 OFFSET $4",
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
    let row = sqlx::query_as::<_, Reminder>("SELECT * FROM reminders WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Reminder not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateReminderRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Reminder>(
        "INSERT INTO reminders
            (id, org_id, type, title, message, target_type, target_id,
             scheduled_at, send_sms, send_email, send_telegram)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(body.org_id)
    .bind(&body.r#type)
    .bind(&body.title)
    .bind(&body.message)
    .bind(&body.target_type)
    .bind(body.target_id)
    .bind(body.scheduled_at)
    .bind(body.send_sms.unwrap_or(false))
    .bind(body.send_email.unwrap_or(false))
    .bind(body.send_telegram.unwrap_or(false))
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn delete(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query("DELETE FROM reminders WHERE id = $1 AND status = 'pending'")
        .bind(id)
        .execute(&mut *tx)
        .await?;
    if rows.rows_affected() == 0 {
        return Err(AppError::Conflict(
            "Cannot delete a sent/failed reminder".into(),
        ));
    }
    tx.commit().await?;
    Ok(Json(json!({ "message": "Deleted" })))
}

pub async fn cancel(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    sqlx::query(
        "UPDATE reminders SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND status = 'pending'",
    )
    .bind(id)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "Cancelled" })))
}

pub async fn send_now(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Reminder>("SELECT * FROM reminders WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Reminder not found".into()))?;

    sqlx::query(
        "UPDATE reminders SET status = 'sent', sent_at = NOW(), updated_at = NOW() WHERE id = $1",
    )
    .bind(id)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;

    let room = format!("org:{}", row.org_id);
    state.ws_hub.broadcast_to_room(
        &room,
        &crate::realtime::hub::WsEvent {
            event: "reminder.sent".into(),
            room: Some(room.clone()),
            payload: json!({
                "reminder_id": row.id,
                "title": row.title,
                "message": row.message,
                "type": row.r#type
            }),
        },
    );

    Ok(Json(json!({ "message": "Reminder dispatched", "channels": {
        "sms": row.send_sms, "email": row.send_email, "telegram": row.send_telegram
    }})))
}
