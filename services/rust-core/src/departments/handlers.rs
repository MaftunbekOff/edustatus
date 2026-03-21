use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::auth::models::UserProfile;
use crate::departments::models::*;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<DeptListQuery>,
) -> AppResult<Json<Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(50).clamp(1, 200);
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query_as::<_, Department>(
        "SELECT * FROM departments WHERE ($1::uuid IS NULL OR org_id = $1)
         ORDER BY name LIMIT $2 OFFSET $3",
    )
    .bind(q.org_id)
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
    let row = sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Department not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateDeptRequest>,
) -> AppResult<Json<Value>> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Department>(
        "INSERT INTO departments (id, org_id, name, code, description, manager_name, specialty, course, year)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(body.org_id)
    .bind(&body.name)
    .bind(&body.code)
    .bind(&body.description)
    .bind(&body.manager_name)
    .bind(&body.specialty)
    .bind(body.course)
    .bind(body.year)
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({ "data": row })))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateDeptRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, Department>(
        "UPDATE departments SET
            name         = COALESCE($1, name),
            code         = COALESCE($2, code),
            description  = COALESCE($3, description),
            manager_name = COALESCE($4, manager_name),
            specialty    = COALESCE($5, specialty),
            course       = COALESCE($6, course),
            year         = COALESCE($7, year),
            updated_at   = NOW()
         WHERE id = $8 RETURNING *",
    )
    .bind(&body.name)
    .bind(&body.code)
    .bind(&body.description)
    .bind(&body.manager_name)
    .bind(&body.specialty)
    .bind(body.course)
    .bind(body.year)
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Department not found".into()))?;
    tx.commit().await?;
    Ok(Json(json!({ "data": row })))
}

pub async fn delete(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let rows = sqlx::query("DELETE FROM departments WHERE id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await?;
    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound("Department not found".into()));
    }
    tx.commit().await?;
    Ok(Json(json!({ "message": "Department deleted" })))
}

pub async fn clients_in_dept(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let clients = sqlx::query_as::<_, crate::clients::models::Client>(
        "SELECT * FROM clients WHERE dept_id = $1 AND status = 'active' ORDER BY full_name",
    )
    .bind(id)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": clients })))
}
