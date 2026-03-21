pub mod handlers;
pub mod models;
pub mod service;

use axum::{routing::{delete, get, patch, post, put}, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",        get(handlers::list).post(handlers::create))
        .route("/stats",   get(handlers::stats))
        .route("/{id}",    get(handlers::get)
                            .put(handlers::update)
                            .patch(handlers::update)
                            .delete(handlers::delete))
        .route("/{id}/children", get(handlers::children))
        .route("/{id}/admins",   get(handlers::list_admins).post(handlers::create_admin))
        .route("/{id}/admins/{admin_id}",
               delete(handlers::delete_admin)
               .patch(handlers::update_admin_role))
}
