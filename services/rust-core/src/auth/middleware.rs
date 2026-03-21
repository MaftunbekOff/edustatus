use axum::{
    body::Body,
    extract::{Request, State},
    http::header,
    middleware::Next,
    response::Response,
};
use axum_extra::extract::CookieJar;
use std::sync::Arc;

use crate::auth::{jwt::JwtManager, models::UserProfile};
use crate::errors::AppError;
use crate::state::AppState;

pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(&req)?;

    let jwt = JwtManager::new(
        &state.config.jwt_secret,
        state.config.jwt_access_ttl_secs,
        state.config.jwt_refresh_ttl_secs,
    );

    let claims = jwt.verify_access_token(&token)?;

    // Check Redis blacklist for revoked tokens
    let blacklist_key = format!("blacklist:token:{}", claims.jti);
    let mut redis = state.redis.clone();
    let revoked: bool = redis::AsyncCommands::exists(&mut redis, &blacklist_key)
        .await
        .unwrap_or(false);

    if revoked {
        return Err(AppError::Unauthorized("Token has been revoked".into()));
    }

    let mut tx = state
        .begin_skip_rls_transaction()
        .await
        .map_err(AppError::Database)?;
    let user = sqlx::query_as::<_, crate::auth::models::User>(
        "SELECT * FROM users WHERE id = $1 AND is_active = true",
    )
    .bind(claims.sub)
    .fetch_optional(&mut *tx)
    .await
    .map_err(AppError::Database)?
    .ok_or_else(|| AppError::Unauthorized("User not found or inactive".into()))?;
    tx.commit().await.map_err(AppError::Database)?;

    let profile: UserProfile = user.into();
    req.extensions_mut().insert(profile);

    Ok(next.run(req).await)
}

fn extract_token(req: &Request<Body>) -> Result<String, AppError> {
    // 1. Authorization: Bearer <token>
    if let Some(auth_header) = req.headers().get(header::AUTHORIZATION) {
        if let Ok(value) = auth_header.to_str() {
            if let Some(token) = value.strip_prefix("Bearer ") {
                return Ok(token.to_string());
            }
        }
    }

    // 2. Cookie: accessToken=<token>
    let jar = CookieJar::from_headers(req.headers());
    if let Some(cookie) = jar.get("accessToken") {
        return Ok(cookie.value().to_string());
    }

    Err(AppError::Unauthorized("No authentication token provided".into()))
}

pub fn require_role(user: &UserProfile, allowed: &[&str]) -> Result<(), AppError> {
    if allowed.contains(&user.role.as_str()) {
        Ok(())
    } else {
        Err(AppError::Forbidden(format!(
            "Role '{}' is not permitted for this resource",
            user.role
        )))
    }
}
