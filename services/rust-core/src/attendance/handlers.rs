use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::attendance::models::*;
use crate::auth::models::UserProfile;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<AttendanceListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(50).clamp(1, 500);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Attendance>(
        "SELECT a.* FROM attendance a
         LEFT JOIN clients c ON c.id = a.client_id
         WHERE ($1::uuid IS NULL OR a.org_id   = $1)
           AND ($2::uuid IS NULL OR c.dept_id  = $2)
           AND ($3::date IS NULL OR a.date     = $3)
           AND ($4::text IS NULL OR a.status   = $4)
         ORDER BY a.date DESC, a.created_at DESC
         LIMIT $5 OFFSET $6",
    )
    .bind(q.org_id)
    .bind(q.dept_id)
    .bind(q.date)
    .bind(&q.status)
    .bind(limit)
    .bind((page - 1) * limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

pub async fn record(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<RecordAttendanceRequest>,
) -> AppResult<Json<Value>> {
    let valid_statuses = ["present", "absent", "late", "excused"];
    if !valid_statuses.contains(&body.status.as_str()) {
        return Err(AppError::Validation(format!(
            "Invalid status '{}'. Must be one of: {:?}",
            body.status, valid_statuses
        )));
    }

    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Attendance>(
        "INSERT INTO attendance (id, org_id, client_id, date, status, note)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (client_id, date) DO UPDATE
            SET status = EXCLUDED.status, note = EXCLUDED.note
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(body.org_id)
    .bind(body.client_id)
    .bind(body.date)
    .bind(&body.status)
    .bind(&body.note)
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    let room = format!("org:{}", body.org_id);
    state.ws_hub.broadcast_to_room(
        &room,
        &crate::realtime::hub::WsEvent {
            event: "attendance.recorded".into(),
            room: Some(room.clone()),
            payload: json!({
                "client_id": body.client_id,
                "date": body.date.to_string(),
                "status": body.status
            }),
        },
    );

    Ok(Json(json!({ "data": row })))
}

pub async fn bulk_record(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<BulkAttendanceRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let mut count = 0usize;

    for entry in &body.records {
        sqlx::query(
            "INSERT INTO attendance (id, org_id, client_id, date, status, note)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT (client_id, date) DO UPDATE
                SET status = EXCLUDED.status, note = EXCLUDED.note",
        )
        .bind(Uuid::new_v4())
        .bind(body.org_id)
        .bind(entry.client_id)
        .bind(body.date)
        .bind(&entry.status)
        .bind(&entry.note)
        .execute(&mut *tx)
        .await?;
        count += 1;
    }

    tx.commit().await?;

    let room = format!("org:{}", body.org_id);
    state.ws_hub.broadcast_to_room(
        &room,
        &crate::realtime::hub::WsEvent {
            event: "attendance.bulk_recorded".into(),
            room: Some(room.clone()),
            payload: json!({ "date": body.date.to_string(), "count": count }),
        },
    );

    Ok(Json(json!({ "recorded": count })))
}

pub async fn client_attendance(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Query(q): Query<AttendanceListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(30).clamp(1, 365);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Attendance>(
        "SELECT * FROM attendance WHERE client_id = $1
         ORDER BY date DESC LIMIT $2 OFFSET $3",
    )
    .bind(id)
    .bind(limit)
    .bind((page - 1) * limit)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": rows })))
}

pub async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(org_id): Path<Uuid>,
    Query(q): Query<std::collections::HashMap<String, String>>,
) -> AppResult<Json<Value>> {
    let date_str = q
        .get("date")
        .cloned()
        .unwrap_or_else(|| chrono::Local::now().format("%Y-%m-%d").to_string());

    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, (Option<i64>, Option<i64>, Option<i64>, Option<i64>)>(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'present'),
            COUNT(*) FILTER (WHERE status = 'absent'),
            COUNT(*) FILTER (WHERE status = 'late'),
            COUNT(*) FILTER (WHERE status = 'excused')
         FROM attendance WHERE org_id = $1 AND date = $2::date",
    )
    .bind(org_id)
    .bind(&date_str)
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({
        "data": {
            "date": date_str,
            "present": row.0, "absent": row.1,
            "late": row.2, "excused": row.3
        }
    })))
}
