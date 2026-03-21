use axum::{
    extract::{Extension, Path, Query, State},
    http::{header, HeaderMap},
    response::{IntoResponse, Response},
    Json,
};
use axum_extra::extract::CookieJar;
use chrono::Utc;
use redis::AsyncCommands;
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::auth::{
    jwt::JwtManager,
    models::{ChangePasswordRequest, LoginRequest, RefreshRequest, RegisterRequest, UserProfile},
    service,
};
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

/// Format an auth cookie string, adding the `Secure` flag in production.
fn auth_cookie(name: &str, value: &str, path: &str, max_age: i64, is_production: bool) -> String {
    let secure = if is_production { "; Secure" } else { "" };
    format!("{name}={value}; HttpOnly; SameSite=Lax; Path={path}{secure}; Max-Age={max_age}")
}

fn extract_ip(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-real-ip")
        .or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string())
}

fn extract_user_agent(headers: &HeaderMap) -> Option<String> {
    headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
}

/// POST /api/v1/auth/login
/// Accepts { email, password } OR { username, password } (NestJS legacy)
/// Returns { user, message } and sets accessToken + refreshToken cookies
pub async fn login(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(body): Json<LoginRequest>,
) -> Result<Response, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let ip = extract_ip(&headers);
    let ua = extract_user_agent(&headers);
    let auth = service::login(&state, &body, ip, ua).await?;

    let access_ttl = state.config.jwt_access_ttl_secs;
    let refresh_ttl = state.config.jwt_refresh_ttl_secs;
    let prod = state.config.is_production();

    let access_cookie = auth_cookie("accessToken", &auth.access_token, "/", access_ttl, prod);
    let refresh_cookie = auth_cookie("refreshToken", &auth.refresh_token, "/api/v1/auth", refresh_ttl, prod);

    let body = Json(json!({
        "user": auth.user,
        "message": "Login successful"
    }));

    let mut response = body.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        access_cookie.parse().map_err(|_| AppError::Internal(anyhow::anyhow!("cookie header")))?,
    );
    response.headers_mut().append(
        header::SET_COOKIE,
        refresh_cookie.parse().map_err(|_| AppError::Internal(anyhow::anyhow!("cookie header")))?,
    );

    Ok(response)
}

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let user = service::register(&state, &body).await?;
    Ok(Json(json!({ "data": user })))
}

pub async fn refresh(
    State(state): State<Arc<AppState>>,
    cookies: CookieJar,
    Json(body): Json<RefreshRequest>,
) -> Result<Response, AppError> {
    let token = body
        .refresh_token
        .or_else(|| cookies.get("refreshToken").map(|c| c.value().to_string()))
        .ok_or_else(|| AppError::Unauthorized("No refresh token provided".into()))?;

    let auth = service::refresh_tokens(&state, &token).await?;

    let access_ttl = state.config.jwt_access_ttl_secs;
    let access_cookie = auth_cookie("accessToken", &auth.access_token, "/", access_ttl, state.config.is_production());

    let body = Json(json!({ "user": auth.user }));
    let mut response = body.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        access_cookie.parse().map_err(|_| AppError::Internal(anyhow::anyhow!("cookie")))?,
    );

    Ok(response)
}

/// POST /api/v1/auth/logout — blacklist the current access token JTI and clear cookies.
pub async fn logout(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    cookies: CookieJar,
) -> Response {
    // Extract access token from either the Authorization header or the cookie.
    let token = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer ").map(|t| t.to_string()))
        .or_else(|| cookies.get("accessToken").map(|c| c.value().to_string()));

    // Best-effort: write the JTI to the Redis blacklist so the token cannot be
    // reused even within its remaining TTL window.
    if let Some(token_str) = token {
        let jwt = JwtManager::new(
            &state.config.jwt_secret,
            state.config.jwt_access_ttl_secs,
            state.config.jwt_refresh_ttl_secs,
        );
        if let Some(claims) = jwt.decode_access_claims_unchecked(&token_str) {
            let remaining_ttl = (claims.exp - Utc::now().timestamp()).max(0) as u64;
            if remaining_ttl > 0 {
                let mut redis = state.redis.clone();
                let key = format!("blacklist:token:{}", claims.jti);
                let _: () = redis.set_ex(&key, "1", remaining_ttl).await.unwrap_or(());
            }
        }
    }

    let prod = state.config.is_production();
    let clear_access = auth_cookie("accessToken", "", "/", 0, prod);
    let clear_refresh = auth_cookie("refreshToken", "", "/api/v1/auth", 0, prod);

    let body = Json(json!({ "message": "Logged out successfully" }));
    let mut response = body.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        clear_access.parse().unwrap(),
    );
    response.headers_mut().append(
        header::SET_COOKIE,
        clear_refresh.parse().unwrap(),
    );
    response
}

/// GET /api/v1/auth/me — returns user profile directly (no wrapper)
pub async fn me(
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<UserProfile>> {
    Ok(Json(user))
}

pub async fn logout_all(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<Value>> {
    service::logout_all(&state, user.id).await?;
    Ok(Json(json!({ "message": "All sessions terminated" })))
}

pub async fn list_sessions(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
) -> AppResult<Json<Value>> {
    let mut tx = state.begin_skip_rls_transaction().await?;
    let sessions = sqlx::query_as::<_, crate::auth::models::Session>(
        "SELECT * FROM sessions WHERE user_id = $1 AND is_active = true ORDER BY last_used_at DESC",
    )
    .bind(user.id)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(Json(json!({ "data": sessions })))
}

pub async fn revoke_session(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Value>> {
    let mut tx = state.begin_skip_rls_transaction().await?;
    let affected = sqlx::query(
        "UPDATE sessions SET is_active = false WHERE id = $1 AND user_id = $2",
    )
    .bind(id)
    .bind(user.id)
    .execute(&mut *tx)
    .await?;

    if affected.rows_affected() == 0 {
        return Err(AppError::NotFound("Session not found".into()));
    }
    tx.commit().await?;
    Ok(Json(json!({ "message": "Session revoked" })))
}

pub async fn change_password(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<ChangePasswordRequest>,
) -> AppResult<Json<Value>> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    service::change_password(&state, user.id, &body.old_password, &body.new_password).await?;
    Ok(Json(json!({ "message": "Password changed successfully" })))
}

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

pub async fn login_history(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(params): Query<PaginationQuery>,
) -> AppResult<Json<Value>> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut tx = state.begin_skip_rls_transaction().await?;

    let rows = sqlx::query_as::<_, crate::auth::models::LoginHistory>(
        "SELECT * FROM login_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    )
    .bind(user.id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut *tx)
    .await?;

    let total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM login_history WHERE user_id = $1",
    )
    .bind(user.id)
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(Json(json!({
        "data": rows,
        "pagination": { "page": page, "limit": limit, "total": total }
    })))
}
