pub mod engine;
pub mod handlers;
pub mod models;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        // Invoices
        .route("/invoices", get(handlers::list_invoices).post(handlers::create_invoice))
        .route("/invoices/{id}", get(handlers::get_invoice).put(handlers::update_invoice))
        .route("/invoices/{id}/pay", post(handlers::pay_invoice))
        .route("/invoices/{id}/cancel", post(handlers::cancel_invoice))
        // Subscriptions
        .route("/subscriptions", get(handlers::list_subscriptions).post(handlers::create_subscription))
        .route("/subscriptions/{id}", get(handlers::get_subscription))
        .route("/subscriptions/{id}/cancel", post(handlers::cancel_subscription))
        // Payments
        .route("/payments", get(handlers::list_payments))
        .route("/payments/{id}", get(handlers::get_payment))
        // Stats
        .route("/stats", get(handlers::billing_stats))
        .route("/revenue", get(handlers::revenue_report))
}
