pub mod handlers;
pub mod models;

use axum::{routing::{get, post}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",               get(handlers::list).post(handlers::record))
        .route("/bulk",           post(handlers::bulk_record))
        .route("/stats/{org_id}", get(handlers::stats))
        .route("/client/{id}",    get(handlers::client_attendance))
}
