use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct UserRow {
    pub id: Uuid,
    pub email: String,
    pub full_name: String,
    pub role: String,
    pub org_id: Option<Uuid>,
    pub phone: Option<String>,
    pub is_active: bool,
    pub is_verified: bool,
    pub avatar_url: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 2, max = 100))]
    pub full_name: String,
    pub phone: Option<String>,
    pub role: String,
    pub org_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateUserRequest {
    #[validate(length(min = 2, max = 100))]
    pub full_name: Option<String>,
    pub phone: Option<String>,
    pub avatar_url: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UserListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub role: Option<String>,
    pub org_id: Option<Uuid>,
    pub is_active: Option<bool>,
    pub search: Option<String>,
}
