pub mod handlers;
pub mod models;

use axum::{routing::{get, post}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",             get(handlers::list).post(handlers::create))
        .route("/{id}",         get(handlers::get).delete(handlers::delete))
        .route("/{id}/cancel",  post(handlers::cancel))
        .route("/{id}/send",    post(handlers::send_now))
}
