pub mod handlers;

use axum::{routing::get, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",         get(handlers::health_full))
        .route("/live",     get(handlers::liveness))
        .route("/ready",    get(handlers::readiness))
        .route("/metrics",  get(handlers::metrics))
}
