use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::auth::models::UserProfile;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use crate::users::{
    models::{CreateUserRequest, UpdateUserRequest, UserListQuery},
    service,
};

#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
struct UserStats {
    active: Option<i64>,
    inactive: Option<i64>,
    admins: Option<i64>,
    users_count: Option<i64>,
    new_this_week: Option<i64>,
}

pub async fn list_users(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<UserListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let (users, total) = service::list_users(&mut tx, &q).await?;
    tx.commit().await?;
    let page = q.page.unwrap_or(1);
    let limit = q.limit.unwrap_or(20);
    Ok(Json(json!({
        "data": users,
        "pagination": { "page": page, "limit": limit, "total": total }
    })))
}

pub async fn get_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let u = service::get_user(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": u })))
}

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateUserRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let u = service::create_user(&mut tx, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": u })))
}

pub async fn update_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateUserRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let u = service::update_user(&mut tx, id, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": u })))
}

pub async fn delete_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::delete_user(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "User deleted" })))
}

pub async fn activate_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::set_active(&mut tx, id, true).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "User activated" })))
}

pub async fn deactivate_user(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::set_active(&mut tx, id, false).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "User deactivated" })))
}

pub async fn search_users(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<UserListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let (users, total) = service::list_users(&mut tx, &q).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": users, "total": total })))
}

pub async fn user_stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let stats = sqlx::query_as::<_, UserStats>(
        "SELECT
            COUNT(*) FILTER (WHERE is_active = true)                          AS active,
            COUNT(*) FILTER (WHERE is_active = false)                         AS inactive,
            COUNT(*) FILTER (WHERE role = 'admin')                            AS admins,
            COUNT(*) FILTER (WHERE role = 'user')                             AS users_count,
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')   AS new_this_week
         FROM users",
    )
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(Json(json!({
        "data": {
            "active":        stats.active,
            "inactive":      stats.inactive,
            "admins":        stats.admins,
            "users":         stats.users_count,
            "new_this_week": stats.new_this_week
        }
    })))
}
