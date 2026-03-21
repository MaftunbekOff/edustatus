use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Client {
    pub id: Uuid,
    pub org_id: Uuid,
    pub dept_id: Option<Uuid>,
    pub pinfl: Option<String>,
    pub contract_number: Option<String>,
    pub full_name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub birth_date: Option<NaiveDate>,
    pub total_amount: i64,
    pub paid_amount: i64,
    pub debt_amount: i64,
    pub status: String,
    pub additional_info: Option<serde_json::Value>,
    pub contact_phone: Option<String>,
    pub contact_name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ClientSummary {
    pub id: Uuid,
    pub org_id: Uuid,
    pub full_name: String,
    pub phone: Option<String>,
    pub pinfl: Option<String>,
    pub status: String,
    pub total_amount: i64,
    pub paid_amount: i64,
    pub debt_amount: i64,
    pub department_name: Option<String>,
    pub confirmed_payments: Option<i64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateClientRequest {
    pub org_id: Uuid,
    pub dept_id: Option<Uuid>,
    pub pinfl: Option<String>,
    pub contract_number: Option<String>,
    #[validate(length(min = 3, max = 150))]
    pub full_name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub birth_date: Option<NaiveDate>,
    #[validate(range(min = 0))]
    pub total_amount: Option<i64>,
    pub additional_info: Option<serde_json::Value>,
    pub contact_phone: Option<String>,
    pub contact_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateClientRequest {
    pub dept_id: Option<Uuid>,
    pub full_name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub birth_date: Option<NaiveDate>,
    pub total_amount: Option<i64>,
    pub status: Option<String>,
    pub additional_info: Option<serde_json::Value>,
    pub contact_phone: Option<String>,
    pub contact_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ClientListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub org_id: Option<Uuid>,
    pub dept_id: Option<Uuid>,
    pub status: Option<String>,
    pub search: Option<String>,
    pub has_debt: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct RecordPaymentRequest {
    pub amount: i64,
    pub payment_method: String,
    pub payment_date: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub reference_number: Option<String>,
}
