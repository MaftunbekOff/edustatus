pub mod hub;
pub mod websocket;

use axum::{routing::get, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/ws", get(websocket::ws_handler))
        .route("/stats", get(stats_handler))
}

async fn stats_handler(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "connections": state.ws_hub.connection_count(),
        "status": "ok"
    }))
}
