use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::Utc;
use redis::AsyncCommands;
use uuid::Uuid;

use crate::auth::{
    jwt::JwtManager,
    models::{AuthResponse, LoginRequest, RegisterRequest, Session, User, UserProfile},
};
use crate::errors::{AppError, AppResult};
use crate::state::{AppState, DbTxn};

const MAX_SESSIONS: i64 = 5;

async fn record_login_history_tx(
    tx: &mut DbTxn<'_>,
    user_id: Option<Uuid>,
    ip: Option<String>,
    user_agent: Option<String>,
    success: bool,
    reason: Option<String>,
) {
    let _ = sqlx::query(
        "INSERT INTO login_history (id, user_id, ip_address, user_agent, success, failure_reason)
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(Uuid::new_v4())
    .bind(user_id)
    .bind(ip)
    .bind(user_agent)
    .bind(success)
    .bind(reason)
    .execute(&mut **tx)
    .await;
}

pub async fn login(
    state: &AppState,
    req: &LoginRequest,
    ip: Option<String>,
    user_agent: Option<String>,
) -> AppResult<AuthResponse> {
    if let Some(ref ip_str) = ip {
        let key = format!("rate:login:{}", ip_str);
        let mut redis = state.redis.clone();
        let attempts: i64 = match redis.incr::<_, _, i64>(&key, 1).await {
            Ok(n) => n,
            Err(_) => return Err(AppError::TooManyRequests),
        };
        if attempts == 1 {
            let _: () = redis.expire(&key, 60).await.unwrap_or(());
        }
        if attempts > 10 {
            if let Ok(mut tx) = state.begin_skip_rls_transaction().await {
                record_login_history_tx(
                    &mut tx,
                    None,
                    ip.clone(),
                    user_agent.clone(),
                    false,
                    Some("Rate limited".into()),
                )
                .await;
                let _ = tx.commit().await;
            }
            return Err(AppError::TooManyRequests);
        }
    }

    let mut tx = state.begin_skip_rls_transaction().await?;

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1 AND is_active = true",
    )
    .bind(&req.email)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid credentials".into()))?;

    let argon2 = Argon2::default();
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Password hash invalid")))?;

    if argon2.verify_password(req.password.as_bytes(), &parsed_hash).is_err() {
        record_login_history_tx(
            &mut tx,
            Some(user.id),
            ip.clone(),
            user_agent.clone(),
            false,
            Some("Invalid password".into()),
        )
        .await;
        tx.commit().await?;
        return Err(AppError::Unauthorized("Invalid credentials".into()));
    }

    let session_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND is_active = true",
    )
    .bind(user.id)
    .fetch_one(&mut *tx)
    .await?;

    if session_count >= MAX_SESSIONS {
        sqlx::query(
            "UPDATE sessions SET is_active = false
             WHERE id IN (
                 SELECT id FROM sessions WHERE user_id = $1 AND is_active = true
                 ORDER BY last_used_at ASC LIMIT $2
             )",
        )
        .bind(user.id)
        .bind(session_count - MAX_SESSIONS + 1)
        .execute(&mut *tx)
        .await?;
    }

    let jwt = JwtManager::new(
        &state.config.jwt_secret,
        state.config.jwt_access_ttl_secs,
        state.config.jwt_refresh_ttl_secs,
    );

    let session_id = Uuid::new_v4();
    let (access_token, _access_jti) = jwt
        .generate_access_token(user.id, &user.role, user.org_id)
        .map_err(AppError::Jwt)?;
    let (refresh_token, refresh_jti) = jwt
        .generate_refresh_token(user.id, session_id)
        .map_err(AppError::Jwt)?;

    let expires_at = Utc::now() + chrono::Duration::seconds(state.config.jwt_refresh_ttl_secs);

    sqlx::query(
        "INSERT INTO sessions (id, user_id, refresh_token_jti, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(session_id)
    .bind(user.id)
    .bind(refresh_jti)
    .bind(&user_agent)
    .bind(&ip)
    .bind(expires_at)
    .execute(&mut *tx)
    .await?;

    record_login_history_tx(&mut tx, Some(user.id), ip, user_agent, true, None).await;

    tx.commit().await?;

    Ok(AuthResponse {
        access_token,
        refresh_token,
        token_type: "Bearer".into(),
        expires_in: state.config.jwt_access_ttl_secs,
        user: user.into(),
    })
}

pub async fn register(
    state: &AppState,
    req: &RegisterRequest,
) -> AppResult<UserProfile> {
    let mut tx = state.begin_skip_rls_transaction().await?;

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
        .bind(&req.email)
        .fetch_one(&mut *tx)
        .await?;

    if exists {
        return Err(AppError::Conflict("Email already registered".into()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Hash error: {}", e)))?
        .to_string();

    const ALLOWED_SELF_REGISTER_ROLES: &[&str] = &["user"];
    let role = req.role.clone().unwrap_or_else(|| "user".into());
    if !ALLOWED_SELF_REGISTER_ROLES.contains(&role.as_str()) {
        return Err(AppError::Forbidden(format!(
            "Role '{}' cannot be assigned during self-registration",
            role
        )));
    }
    let id = Uuid::new_v4();

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (id, email, password_hash, full_name, phone, role, org_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *",
    )
    .bind(id)
    .bind(&req.email)
    .bind(&password_hash)
    .bind(&req.full_name)
    .bind(&req.phone)
    .bind(&role)
    .bind(req.org_id)
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(user.into())
}

pub async fn refresh_tokens(
    state: &AppState,
    refresh_token: &str,
) -> AppResult<AuthResponse> {
    let jwt = JwtManager::new(
        &state.config.jwt_secret,
        state.config.jwt_access_ttl_secs,
        state.config.jwt_refresh_ttl_secs,
    );

    let claims = jwt.verify_refresh_token(refresh_token).map_err(AppError::Jwt)?;

    let mut tx = state.begin_skip_rls_transaction().await?;

    let session = sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions WHERE id = $1 AND refresh_token_jti = $2 AND is_active = true",
    )
    .bind(claims.session_id)
    .bind(claims.jti)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Session invalid or expired".into()))?;

    if session.expires_at < Utc::now() {
        return Err(AppError::Unauthorized("Session expired".into()));
    }

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE id = $1 AND is_active = true",
    )
    .bind(claims.sub)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::Unauthorized("User not found".into()))?;

    let new_session_id = Uuid::new_v4();
    let (access_token, _) = jwt
        .generate_access_token(user.id, &user.role, user.org_id)
        .map_err(AppError::Jwt)?;
    let (new_refresh_token, new_refresh_jti) = jwt
        .generate_refresh_token(user.id, new_session_id)
        .map_err(AppError::Jwt)?;

    let expires_at = Utc::now() + chrono::Duration::seconds(state.config.jwt_refresh_ttl_secs);

    sqlx::query("UPDATE sessions SET is_active = false WHERE id = $1")
        .bind(session.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "INSERT INTO sessions (id, user_id, refresh_token_jti, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(new_session_id)
    .bind(user.id)
    .bind(new_refresh_jti)
    .bind(&session.user_agent)
    .bind(&session.ip_address)
    .bind(expires_at)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(AuthResponse {
        access_token,
        refresh_token: new_refresh_token,
        token_type: "Bearer".into(),
        expires_in: state.config.jwt_access_ttl_secs,
        user: user.into(),
    })
}

pub async fn logout_all(state: &AppState, user_id: Uuid) -> AppResult<()> {
    let mut tx = state.begin_skip_rls_transaction().await?;
    sqlx::query("UPDATE sessions SET is_active = false WHERE user_id = $1")
        .bind(user_id)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(())
}

pub async fn change_password(
    state: &AppState,
    user_id: Uuid,
    old_password: &str,
    new_password: &str,
) -> AppResult<()> {
    let mut tx = state.begin_skip_rls_transaction().await?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let argon2 = Argon2::default();
    let parsed = PasswordHash::new(&user.password_hash)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Hash parse error")))?;

    if argon2.verify_password(old_password.as_bytes(), &parsed).is_err() {
        return Err(AppError::Unauthorized("Incorrect current password".into()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let new_hash = argon2
        .hash_password(new_password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
        .to_string();

    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(user_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE sessions SET is_active = false WHERE user_id = $1")
        .bind(user_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;
    Ok(())
}
