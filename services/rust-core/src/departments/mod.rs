pub mod handlers;
pub mod models;

use axum::{routing::{delete, get, patch, post, put}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",     get(handlers::list).post(handlers::create))
        .route("/{id}", get(handlers::get)
                         .put(handlers::update)
                         .patch(handlers::update)
                         .delete(handlers::delete))
        .route("/{id}/clients", get(handlers::clients_in_dept))
}
