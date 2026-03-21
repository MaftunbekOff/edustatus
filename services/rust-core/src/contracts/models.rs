use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Contract {
    pub id: Uuid,
    pub org_id: Uuid,
    pub client_id: Uuid,
    pub contract_number: String,
    pub contract_date: NaiveDate,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub amount: i64,
    pub payment_schedule: Option<serde_json::Value>,
    pub document_url: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateContractRequest {
    pub org_id: Uuid,
    pub client_id: Uuid,
    pub contract_number: String,
    pub contract_date: NaiveDate,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub amount: i64,
    pub payment_schedule: Option<serde_json::Value>,
    pub document_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateContractRequest {
    pub end_date: Option<NaiveDate>,
    pub amount: Option<i64>,
    pub payment_schedule: Option<serde_json::Value>,
    pub document_url: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ContractListQuery {
    pub org_id: Option<Uuid>,
    pub client_id: Option<Uuid>,
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
