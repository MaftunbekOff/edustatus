pub mod handlers;
pub mod models;

use axum::{routing::{get, post}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",              get(handlers::list).post(handlers::import))
        .route("/{id}",          get(handlers::get))
        .route("/{id}/match",    post(handlers::match_payment))
        .route("/{id}/ignore",   post(handlers::ignore))
        .route("/reconcile",     post(handlers::auto_reconcile))
        .route("/stats/{org_id}", get(handlers::stats))
}
