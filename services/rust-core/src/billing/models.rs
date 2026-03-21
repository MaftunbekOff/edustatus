use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::Type)]
#[sqlx(type_name = "invoice_status", rename_all = "lowercase")]
pub enum InvoiceStatus {
    Draft,
    Pending,
    Paid,
    Overdue,
    Cancelled,
    Refunded,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::Type)]
#[sqlx(type_name = "subscription_status", rename_all = "lowercase")]
pub enum SubscriptionStatus {
    Active,
    Cancelled,
    Expired,
    Paused,
    Trial,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Invoice {
    pub id: Uuid,
    pub org_id: Uuid,
    pub user_id: Option<Uuid>,
    pub amount_tiyin: i64,
    pub tax_tiyin: i64,
    pub discount_tiyin: i64,
    pub total_tiyin: i64,
    pub currency: String,
    pub status: InvoiceStatus,
    pub description: Option<String>,
    pub line_items: serde_json::Value,
    pub due_date: Option<DateTime<Utc>>,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Subscription {
    pub id: Uuid,
    pub org_id: Uuid,
    pub plan_id: Uuid,
    pub status: SubscriptionStatus,
    pub trial_ends_at: Option<DateTime<Utc>>,
    pub current_period_start: DateTime<Utc>,
    pub current_period_end: DateTime<Utc>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Billing payment (billing_payments table)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BillingPayment {
    pub id: Uuid,
    pub invoice_id: Uuid,
    pub org_id: Uuid,
    pub amount_tiyin: i64,
    pub currency: String,
    pub provider: String,
    pub provider_payment_id: Option<String>,
    pub status: String,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

/// Client payment (payments table — business-level)
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Payment {
    pub id: Uuid,
    pub org_id: Uuid,
    pub client_id: Uuid,
    pub amount: i64,
    pub currency: String,
    pub payment_method: String,
    pub status: String,
    pub transaction_id: Option<String>,
    pub reference_number: Option<String>,
    pub bank_account: Option<String>,
    pub bank_mfo: Option<String>,
    pub bank_name: Option<String>,
    pub payment_date: DateTime<Utc>,
    pub confirmed_at: Option<DateTime<Utc>>,
    pub confirmed_by: Option<Uuid>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub reconciled: bool,
    pub reconciled_at: Option<DateTime<Utc>>,
    pub reconciled_with: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Plan {
    pub id: Uuid,
    pub name: String,
    pub price_tiyin: i64,
    pub currency: String,
    pub interval: String,
    pub features: serde_json::Value,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateInvoiceRequest {
    pub org_id: Uuid,
    pub user_id: Option<Uuid>,
    #[validate(range(min = 1))]
    pub amount_tiyin: i64,
    pub tax_rate: Option<f64>,
    pub discount_tiyin: Option<i64>,
    pub currency: Option<String>,
    pub description: Option<String>,
    pub line_items: Option<serde_json::Value>,
    pub due_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSubscriptionRequest {
    pub org_id: Uuid,
    pub plan_id: Uuid,
    pub trial_days: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub org_id: Option<Uuid>,
    pub status: Option<String>,
}
