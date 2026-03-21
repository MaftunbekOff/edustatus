pub mod handlers;
pub mod models;
pub mod service;

use axum::{routing::{delete, get, patch, post, put}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",               get(handlers::list).post(handlers::create))
        .route("/debtors",        get(handlers::debtors))
        .route("/duplicates",     get(handlers::duplicates))
        .route("/{id}",           get(handlers::get)
                                   .put(handlers::update)
                                   .patch(handlers::update)
                                   .delete(handlers::delete))
        .route("/{id}/payments",  get(handlers::payment_history).post(handlers::record_payment))
        .route("/stats/{org_id}", get(handlers::stats))
}
