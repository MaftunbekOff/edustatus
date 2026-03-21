use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Reminder {
    pub id: Uuid,
    pub org_id: Uuid,
    pub r#type: String,
    pub title: String,
    pub message: String,
    pub target_type: String,
    pub target_id: Option<Uuid>,
    pub scheduled_at: DateTime<Utc>,
    pub sent_at: Option<DateTime<Utc>>,
    pub status: String,
    pub send_sms: bool,
    pub send_email: bool,
    pub send_telegram: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReminderRequest {
    pub org_id: Uuid,
    pub r#type: String,
    pub title: String,
    pub message: String,
    pub target_type: String,
    pub target_id: Option<Uuid>,
    pub scheduled_at: DateTime<Utc>,
    pub send_sms: Option<bool>,
    pub send_email: Option<bool>,
    pub send_telegram: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ReminderListQuery {
    pub org_id: Option<Uuid>,
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
