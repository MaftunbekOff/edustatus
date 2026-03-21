use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Attendance {
    pub id: Uuid,
    pub org_id: Uuid,
    pub client_id: Uuid,
    pub date: NaiveDate,
    pub status: String,
    pub note: Option<String>,
    pub scanned_at: Option<DateTime<Utc>>,
    pub scanned_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RecordAttendanceRequest {
    pub org_id: Uuid,
    pub client_id: Uuid,
    pub date: NaiveDate,
    pub status: String, // present, absent, late, excused
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BulkAttendanceRequest {
    pub org_id: Uuid,
    pub date: NaiveDate,
    pub records: Vec<AttendanceEntry>,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceEntry {
    pub client_id: Uuid,
    pub status: String,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceListQuery {
    pub org_id: Option<Uuid>,
    pub dept_id: Option<Uuid>,
    pub date: Option<NaiveDate>,
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
