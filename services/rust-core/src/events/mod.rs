//! Incoming webhook event receiver from go-connectors.
//!
//! go-connectors forwards all processed webhook events (payment.completed,
//! payment.failed, etc.) to POST /api/v1/events/incoming. This module:
//!   1. Authenticates the call via the shared INTERNAL_SECRET header.
//!   2. Persists the event to the audit log.
//!   3. Broadcasts the event to the relevant organisation's WebSocket room.

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::post,
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;

use crate::realtime::hub::WsEvent;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new().route("/incoming", post(incoming))
}

#[derive(Debug, Deserialize, Serialize)]
pub struct IncomingEvent {
    /// Unique event ID assigned by go-connectors (may be empty for legacy events)
    pub id: Option<String>,
    /// Event type, e.g. "payment.completed", "subscription.renewed"
    #[serde(rename = "type")]
    pub event_type: String,
    /// Source provider name, e.g. "payme", "stripe"
    pub source: Option<String>,
    /// Raw event payload forwarded from the provider
    pub payload: Value,
    pub timestamp: Option<DateTime<Utc>>,
}

/// POST /api/v1/events/incoming
/// Called exclusively by go-connectors — authenticated via X-Internal-Secret.
async fn incoming(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(event): Json<IncomingEvent>,
) -> StatusCode {
    // Verify the shared internal secret
    let provided = headers
        .get("x-internal-secret")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if provided != state.config.internal_secret {
        tracing::warn!(
            source = ?event.source,
            event_type = %event.event_type,
            "Rejected /events/incoming: invalid internal secret"
        );
        return StatusCode::UNAUTHORIZED;
    }

    let source = event.source.as_deref().unwrap_or("unknown");
    tracing::info!(
        event_type = %event.event_type,
        source = %source,
        "Incoming webhook event from go-connectors"
    );

    // Persist to audit log (fire-and-forget — don't fail the response on DB errors)
    if let Ok(mut tx) = state.begin_skip_rls_transaction().await {
        let ins = sqlx::query(
            "INSERT INTO audit_logs (id, action, entity, old_value, created_at)
             VALUES ($1, $2, 'webhook_event', $3, NOW())",
        )
        .bind(Uuid::new_v4())
        .bind(&event.event_type)
        .bind(&event.payload)
        .execute(&mut *tx)
        .await;
        if ins.is_ok() {
            let _ = tx.commit().await;
        }
    }

    // Broadcast to the relevant org room if the payload contains an org / organization id
    let org_id = event.payload.get("org_id")
        .or_else(|| event.payload.get("organization_id"))
        .and_then(|v| v.as_str());

    // Only broadcast to the organisation room — avoids leaking payment data to all WS clients.
    if let Some(org) = org_id {
        let room = format!("org:{}", org);
        state.ws_hub.broadcast_to_room(&room, &WsEvent {
            event: event.event_type.clone(),
            room: Some(room.clone()),
            payload: serde_json::json!({
                "source": source,
                "event": event.event_type,
                "payload": event.payload,
                "timestamp": event.timestamp,
            }),
        });
    }

    StatusCode::NO_CONTENT
}
