use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BankRecord {
    pub id: Uuid,
    pub org_id: Uuid,
    pub transaction_id: String,
    pub amount: i64,
    pub currency: String,
    pub sender_account: Option<String>,
    pub sender_name: Option<String>,
    pub sender_mfo: Option<String>,
    pub receiver_account: Option<String>,
    pub receiver_mfo: Option<String>,
    pub purpose: Option<String>,
    pub transaction_date: DateTime<Utc>,
    pub status: String,
    pub matched_with: Option<Uuid>,
    pub matched_at: Option<DateTime<Utc>>,
    pub imported_from: Option<String>,
    pub imported_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ImportBankRecordRequest {
    pub org_id: Uuid,
    pub records: Vec<BankRecordInput>,
}

#[derive(Debug, Deserialize)]
pub struct BankRecordInput {
    pub transaction_id: String,
    pub amount: i64,
    pub currency: Option<String>,
    pub sender_account: Option<String>,
    pub sender_name: Option<String>,
    pub sender_mfo: Option<String>,
    pub receiver_account: Option<String>,
    pub receiver_mfo: Option<String>,
    pub purpose: Option<String>,
    pub transaction_date: DateTime<Utc>,
    pub imported_from: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MatchPaymentRequest {
    pub payment_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct BankRecordListQuery {
    pub org_id: Option<Uuid>,
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
