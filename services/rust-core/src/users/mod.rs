pub mod handlers;
pub mod models;
pub mod service;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(handlers::list_users).post(handlers::create_user))
        .route("/{id}", get(handlers::get_user).put(handlers::update_user).delete(handlers::delete_user))
        .route("/{id}/activate", post(handlers::activate_user))
        .route("/{id}/deactivate", post(handlers::deactivate_user))
        .route("/search", get(handlers::search_users))
        .route("/stats", get(handlers::user_stats))
}
