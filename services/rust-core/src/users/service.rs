use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::state::DbTxn;
use crate::users::models::{CreateUserRequest, UpdateUserRequest, UserListQuery, UserRow};

pub async fn list_users(tx: &mut DbTxn<'_>, q: &UserListQuery) -> AppResult<(Vec<UserRow>, i64)> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let rows = sqlx::query_as::<_, UserRow>(
        "SELECT id, email, full_name, role, org_id, phone, is_active, is_verified,
                avatar_url, metadata, created_at, updated_at
         FROM users
         WHERE ($1::text IS NULL OR role = $1)
           AND ($2::uuid IS NULL OR org_id = $2)
           AND ($3::bool IS NULL OR is_active = $3)
           AND ($4::text IS NULL OR email ILIKE $4 OR full_name ILIKE $4)
         ORDER BY created_at DESC
         LIMIT $5 OFFSET $6",
    )
    .bind(&q.role)
    .bind(q.org_id)
    .bind(q.is_active)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut **tx)
    .await?;

    let total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM users
         WHERE ($1::text IS NULL OR role = $1)
           AND ($2::uuid IS NULL OR org_id = $2)
           AND ($3::bool IS NULL OR is_active = $3)
           AND ($4::text IS NULL OR email ILIKE $4 OR full_name ILIKE $4)",
    )
    .bind(&q.role)
    .bind(q.org_id)
    .bind(q.is_active)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .fetch_one(&mut **tx)
    .await?;

    Ok((rows, total))
}

pub async fn get_user(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<UserRow> {
    sqlx::query_as::<_, UserRow>(
        "SELECT id, email, full_name, role, org_id, phone, is_active, is_verified,
                avatar_url, metadata, created_at, updated_at
         FROM users WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("User {} not found", id)))
}

pub async fn create_user(tx: &mut DbTxn<'_>, req: &CreateUserRequest) -> AppResult<UserRow> {
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
            .bind(&req.email)
            .fetch_one(&mut **tx)
            .await?;

    if exists {
        return Err(AppError::Conflict("Email already in use".into()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
        .to_string();

    let user = sqlx::query_as::<_, UserRow>(
        "INSERT INTO users (id, email, password_hash, full_name, role, org_id, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, full_name, role, org_id, phone, is_active, is_verified,
                   avatar_url, metadata, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(&req.email)
    .bind(&hash)
    .bind(&req.full_name)
    .bind(&req.role)
    .bind(req.org_id)
    .bind(&req.phone)
    .fetch_one(&mut **tx)
    .await?;

    Ok(user)
}

pub async fn update_user(tx: &mut DbTxn<'_>, id: Uuid, req: &UpdateUserRequest) -> AppResult<UserRow> {
    let user = sqlx::query_as::<_, UserRow>(
        "UPDATE users
         SET full_name   = COALESCE($1, full_name),
             phone       = COALESCE($2, phone),
             avatar_url  = COALESCE($3, avatar_url),
             metadata    = COALESCE($4, metadata),
             updated_at  = NOW()
         WHERE id = $5
         RETURNING id, email, full_name, role, org_id, phone, is_active, is_verified,
                   avatar_url, metadata, created_at, updated_at",
    )
    .bind(&req.full_name)
    .bind(&req.phone)
    .bind(&req.avatar_url)
    .bind(&req.metadata)
    .bind(id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("User {} not found", id)))?;

    Ok(user)
}

pub async fn set_active(tx: &mut DbTxn<'_>, id: Uuid, active: bool) -> AppResult<()> {
    let rows = sqlx::query("UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2")
        .bind(active)
        .bind(id)
        .execute(&mut **tx)
        .await?;

    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("User {} not found", id)));
    }
    Ok(())
}

pub async fn delete_user(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<()> {
    let rows = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&mut **tx)
        .await?;

    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("User {} not found", id)));
    }
    Ok(())
}
