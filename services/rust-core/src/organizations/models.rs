use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Organization {
    pub id: Uuid,
    pub name: String,
    pub inn: Option<String>,
    pub r#type: String,
    pub industry: String,
    pub is_government: bool,
    pub region: Option<String>,
    pub district: Option<String>,
    pub parent_id: Option<Uuid>,
    pub subdomain: Option<String>,
    pub custom_domain: Option<String>,
    pub plan: String,
    pub status: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub logo_url: Option<String>,

    pub has_clients: bool,
    pub has_payments: bool,
    pub has_reports: bool,
    pub has_bank_integration: bool,
    pub has_telegram_bot: bool,
    pub has_sms_notifications: bool,
    pub has_excel_import: bool,
    pub has_pdf_reports: bool,
    pub allow_sub_orgs: bool,

    pub client_limit: i32,
    pub department_limit: i32,

    pub subscription_ends_at: Option<DateTime<Utc>>,
    pub trial_ends_at: Option<DateTime<Utc>>,

    /// Data-plane routing: logical region (must match `SHARD_REGIONS` / shard-manager).
    pub shard_region: Option<String>,
    /// Physical shard within region (e.g. `00-0000`).
    pub shard_instance: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OrgAdmin {
    pub id: Uuid,
    pub org_id: Uuid,
    pub email: String,
    pub full_name: String,
    pub phone: Option<String>,
    pub role: String,
    pub status: String,
    pub last_login: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateOrgRequest {
    #[validate(length(min = 2, max = 200))]
    pub name: String,
    pub inn: Option<String>,
    pub r#type: Option<String>,
    pub industry: Option<String>,
    pub is_government: Option<bool>,
    pub region: Option<String>,
    pub district: Option<String>,
    pub parent_id: Option<Uuid>,
    pub email: Option<String>,
    #[validate(length(min = 9, max = 20))]
    pub phone: Option<String>,
    pub address: Option<String>,
    pub plan: Option<String>,
    pub client_limit: Option<i32>,
    pub department_limit: Option<i32>,
    pub trial_days: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrgRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub logo_url: Option<String>,
    pub region: Option<String>,
    pub district: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
    pub client_limit: Option<i32>,
    pub department_limit: Option<i32>,
    pub subscription_ends_at: Option<DateTime<Utc>>,

    // Feature flags
    pub has_bank_integration: Option<bool>,
    pub has_telegram_bot: Option<bool>,
    pub has_sms_notifications: Option<bool>,
    pub has_excel_import: Option<bool>,
    pub has_pdf_reports: Option<bool>,
    pub allow_sub_orgs: Option<bool>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateOrgAdminRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 2, max = 100))]
    pub full_name: String,
    pub phone: Option<String>,
    pub role: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct OrgListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub status: Option<String>,
    pub plan: Option<String>,
    pub search: Option<String>,
    pub parent_id: Option<Uuid>,
}
