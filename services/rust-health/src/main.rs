use axum::{routing::get, Json, Router};
use serde_json::json;

#[tokio::main]
async fn main() {
    let app = Router::new().route(
        "/health",
        get(|| async {
            Json(json!({
                "status": "ok",
                "service": "rust-health",
                "role": "auxiliary health endpoint for Go API aggregation",
            }))
        }),
    );

    let port = std::env::var("PORT").unwrap_or_else(|_| "8083".to_string());
    let addr = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}
