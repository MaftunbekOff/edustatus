use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Department {
    pub id: Uuid,
    pub org_id: Uuid,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    pub manager_name: Option<String>,
    pub specialty: Option<String>,
    pub course: Option<i32>,
    pub year: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateDeptRequest {
    pub org_id: Uuid,
    #[validate(length(min = 2, max = 100))]
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    pub manager_name: Option<String>,
    pub specialty: Option<String>,
    pub course: Option<i32>,
    pub year: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDeptRequest {
    pub name: Option<String>,
    pub code: Option<String>,
    pub description: Option<String>,
    pub manager_name: Option<String>,
    pub specialty: Option<String>,
    pub course: Option<i32>,
    pub year: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct DeptListQuery {
    pub org_id: Option<Uuid>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
