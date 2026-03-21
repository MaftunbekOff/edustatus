use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::auth::jwt::JwtManager;
use crate::realtime::hub::WsEvent;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    /// Short-lived JWT access token. Browsers cannot set custom headers during
    /// the WebSocket handshake, so the token is accepted as a query parameter.
    /// The server validates expiry AND checks the Redis blacklist before
    /// allowing the connection, so a revoked token is rejected even here.
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ClientMessage {
    action: String,
    room: Option<String>,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(q): Query<WsQuery>,
) -> impl IntoResponse {
    // Validate the token and check Redis blacklist before upgrading.
    let user_id = if let Some(token) = q.token {
        resolve_user_id(&state, &token).await
    } else {
        Uuid::nil()
    };

    ws.on_upgrade(move |socket| handle_socket(socket, state, user_id))
}

/// Verify the JWT and ensure it has not been revoked (Redis blacklist).
/// Returns `Uuid::nil()` for anonymous/unauthenticated connections.
async fn resolve_user_id(state: &Arc<AppState>, token: &str) -> Uuid {
    let jwt = JwtManager::new(
        &state.config.jwt_secret,
        state.config.jwt_access_ttl_secs,
        state.config.jwt_refresh_ttl_secs,
    );

    let claims = match jwt.verify_access_token(token) {
        Ok(c) => c,
        Err(_) => return Uuid::nil(),
    };

    // Check Redis blacklist — same as the HTTP require_auth middleware
    let blacklist_key = format!("blacklist:token:{}", claims.jti);
    let mut redis = state.redis.clone();
    let revoked: bool = redis::AsyncCommands::exists(&mut redis, &blacklist_key)
        .await
        .unwrap_or(false);

    if revoked {
        return Uuid::nil();
    }

    claims.sub
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>, user_id: Uuid) {
    let conn_id = Uuid::new_v4();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    state.ws_hub.register(conn_id, user_id, tx);

    state.ws_hub.broadcast_to_user(user_id, &WsEvent {
        event: "connected".into(),
        room: None,
        payload: serde_json::json!({
            "conn_id": conn_id,
            "user_id": user_id
        }),
    });

    let (mut ws_tx, mut ws_rx) = socket.split();

    let outbound = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_tx.send(msg).await.is_err() { break; }
        }
    });

    let hub = Arc::clone(&state.ws_hub);
    let inbound = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_rx.next().await {
            match msg {
                Message::Text(text) => {
                    if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                        match client_msg.action.as_str() {
                            "join" => {
                                if let Some(room) = &client_msg.room {
                                    hub.join_room(conn_id, room);
                                }
                            }
                            "leave" => {
                                if let Some(room) = &client_msg.room {
                                    hub.leave_room(conn_id, room);
                                }
                            }
                            "ping" => {
                                hub.broadcast_to_user(user_id, &WsEvent {
                                    event: "pong".into(),
                                    room: None,
                                    payload: serde_json::json!({ "ts": chrono::Utc::now() }),
                                });
                            }
                            _ => {}
                        }
                    }
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    tokio::select! {
        _ = outbound => {}
        _ = inbound => {}
    }

    state.ws_hub.unregister(conn_id);
}
