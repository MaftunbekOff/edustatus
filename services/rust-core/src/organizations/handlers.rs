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
use crate::organizations::{models::*, service};
use crate::state::AppState;

pub async fn list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<OrgListQuery>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let (orgs, total) = service::list_orgs(&mut tx, &q).await?;
    tx.commit().await?;
    Ok(Json(json!({
        "data": orgs,
        "pagination": { "page": q.page.unwrap_or(1), "limit": q.limit.unwrap_or(20), "total": total }
    })))
}

pub async fn get(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let org = service::get_org(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": org })))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<CreateOrgRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let org = service::create_org(&state, &mut tx, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": org })))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateOrgRequest>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let org = service::update_org(&mut tx, id, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": org })))
}

pub async fn delete(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::delete_org(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "Organization deleted" })))
}

pub async fn children(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let list = service::list_children(&mut tx, id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": list })))
}

pub async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let row = sqlx::query_as::<_, (Option<i64>, Option<i64>, Option<i64>, Option<i64>)>(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'active'),
            COUNT(*) FILTER (WHERE status = 'trial'),
            COUNT(*) FILTER (WHERE status = 'suspended'),
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
         FROM organizations",
    )
    .fetch_one(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({
        "data": {
            "active": row.0, "trial": row.1,
            "suspended": row.2, "new_this_month": row.3
        }
    })))
}

pub async fn list_admins(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(org_id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    let admins = service::list_admins(&mut tx, org_id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": admins })))
}

pub async fn create_admin(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(org_id): Path<Uuid>,
    Json(body): Json<CreateOrgAdminRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let mut tx = state.tenant_tx_for(&user).await?;
    let admin = service::create_admin(&mut tx, org_id, &body).await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": admin })))
}

pub async fn delete_admin(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path((org_id, admin_id)): Path<(Uuid, Uuid)>,
) -> AppResult<Json<Value>> {
    let mut tx = state.tenant_tx_for(&user).await?;
    service::delete_admin(&mut tx, org_id, admin_id).await?;
    tx.commit().await?;
    Ok(Json(json!({ "message": "Admin removed" })))
}

#[derive(serde::Deserialize)]
pub struct UpdateAdminRoleRequest {
    role: Option<String>,
    status: Option<String>,
}

pub async fn update_admin_role(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path((org_id, admin_id)): Path<(Uuid, Uuid)>,
    Json(body): Json<UpdateAdminRoleRequest>,
) -> AppResult<Json<Value>> {
    if body.role.is_none() && body.status.is_none() {
        return Err(AppError::Validation(
            "At least one of 'role' or 'status' must be provided".into(),
        ));
    }

    let mut tx = state.tenant_tx_for(&user).await?;
    let admin = sqlx::query_as::<_, crate::organizations::models::OrgAdmin>(
        "UPDATE org_admins SET
            role   = COALESCE($1, role),
            status = COALESCE($2, status),
            updated_at = NOW()
         WHERE id = $3 AND org_id = $4
         RETURNING id, org_id, email, full_name, phone, role, status, last_login, created_at, updated_at",
    )
    .bind(body.role.as_deref())
    .bind(body.status.as_deref())
    .bind(admin_id)
    .bind(org_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Admin not found".into()))?;
    tx.commit().await?;

    Ok(Json(json!({ "data": admin })))
}
