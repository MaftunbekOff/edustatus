pub mod detector;

use axum::{
    extract::{Extension, State},
    routing::post,
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;

use crate::anomaly::detector::AnomalyDetector;
use crate::auth::models::UserProfile;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/analyze", post(analyze_handler))
        .route("/transaction", post(transaction_anomaly))
}

#[derive(Debug, Deserialize)]
struct AnalyzeRequest {
    historical: Vec<f64>,
    value: f64,
    z_threshold: Option<f64>,
    iqr_multiplier: Option<f64>,
}

async fn analyze_handler(
    State(_state): State<Arc<AppState>>,
    Extension(_user): Extension<UserProfile>,
    Json(body): Json<AnalyzeRequest>,
) -> AppResult<Json<Value>> {
    let detector = AnomalyDetector::with_sensitivity(
        body.z_threshold.unwrap_or(3.0),
        body.iqr_multiplier.unwrap_or(1.5),
    );
    let results = detector.analyze(body.historical, body.value);
    let has_anomaly = results.iter().any(|r| r.is_anomaly);

    Ok(Json(json!({
        "value": body.value,
        "is_anomaly": has_anomaly,
        "methods": results
    })))
}

#[derive(Debug, Deserialize)]
struct TransactionAnomalyRequest {
    org_id: uuid::Uuid,
    amount: f64,
    currency: Option<String>,
}

async fn transaction_anomaly(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Json(body): Json<TransactionAnomalyRequest>,
) -> AppResult<Json<Value>> {
    let allowed = user.role == "super_admin" || user.organization_id == Some(body.org_id);
    if !allowed {
        return Err(AppError::Forbidden(
            "Cannot run anomaly analysis for another organization".into(),
        ));
    }

    let mut tx = state
        .begin_tenant_transaction(user.rls_skip(), user.rls_org_id())
        .await
        .map_err(AppError::Database)?;
    let historical: Vec<f64> = sqlx::query_scalar(
        "SELECT total_tiyin::float8 FROM invoices
         WHERE org_id = $1 AND status = 'paid'::invoice_status
         ORDER BY paid_at DESC LIMIT 100",
    )
    .bind(body.org_id)
    .fetch_all(&mut *tx)
    .await?;
    tx.commit().await.map_err(AppError::Database)?;

    let detector = AnomalyDetector::new();
    let results = detector.analyze(historical, body.amount);
    let is_anomaly = results.iter().any(|r| r.is_anomaly);

    if is_anomaly {
        let room = format!("org:{}", body.org_id);
        state.ws_hub.broadcast_to_room(&room, &crate::realtime::hub::WsEvent {
            event: "anomaly.detected".into(),
            room: Some(room.clone()),
            payload: json!({
                "org_id": body.org_id,
                "amount": body.amount,
                "currency": body.currency,
                "methods": results
            }),
        });
    }

    Ok(Json(json!({
        "is_anomaly": is_anomaly,
        "amount": body.amount,
        "methods": results
    })))
}
