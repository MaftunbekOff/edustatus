pub mod handlers;
pub mod jwt;
pub mod middleware;
pub mod models;
pub mod service;

use axum::{
    middleware as axum_middleware,
    routing::{delete, get, post},
    Router,
};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes(state: Arc<AppState>) -> Router<Arc<AppState>> {
    let protected = Router::new()
        .route("/me", get(handlers::me))
        .route("/sessions", get(handlers::list_sessions))
        .route("/sessions/{id}", delete(handlers::revoke_session))
        .route("/logout-all", post(handlers::logout_all))
        .route("/change-password", post(handlers::change_password))
        .route("/login-history", get(handlers::login_history))
        .route_layer(axum_middleware::from_fn_with_state(
            state,
            middleware::require_auth,
        ));

    Router::new()
        .route("/login", post(handlers::login))
        .route("/register", post(handlers::register))
        .route("/refresh", post(handlers::refresh))
        .route("/logout", post(handlers::logout))
        .merge(protected)
}
