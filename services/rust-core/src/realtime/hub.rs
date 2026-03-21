use axum::extract::ws::Message;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use uuid::Uuid;

pub type Tx = mpsc::UnboundedSender<Message>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WsEvent {
    pub event: String,
    pub room: Option<String>,
    pub payload: serde_json::Value,
}

struct Client {
    tx: Tx,
    user_id: Uuid,
    rooms: Vec<String>,
}

pub struct WsHub {
    clients: DashMap<Uuid, Client>,
}

impl WsHub {
    pub fn new() -> Self {
        Self {
            clients: DashMap::new(),
        }
    }

    pub fn register(&self, conn_id: Uuid, user_id: Uuid, tx: Tx) {
        self.clients.insert(conn_id, Client { tx, user_id, rooms: vec![] });
        tracing::debug!("WS client {} registered (user {})", conn_id, user_id);
    }

    pub fn unregister(&self, conn_id: Uuid) {
        self.clients.remove(&conn_id);
        tracing::debug!("WS client {} disconnected", conn_id);
    }

    pub fn join_room(&self, conn_id: Uuid, room: &str) {
        if let Some(mut client) = self.clients.get_mut(&conn_id) {
            if !client.rooms.contains(&room.to_string()) {
                client.rooms.push(room.to_string());
            }
        }
    }

    pub fn leave_room(&self, conn_id: Uuid, room: &str) {
        if let Some(mut client) = self.clients.get_mut(&conn_id) {
            client.rooms.retain(|r| r != room);
        }
    }

    pub fn broadcast_to_room(&self, room: &str, event: &WsEvent) {
        let text = match serde_json::to_string(event) {
            Ok(t) => t,
            Err(e) => { tracing::error!("Serialize WsEvent: {}", e); return; }
        };

        let dead: Vec<Uuid> = self
            .clients
            .iter()
            .filter(|entry| entry.rooms.contains(&room.to_string()))
            .filter_map(|entry| {
                let id = *entry.key();
                if entry.tx.send(Message::Text(text.clone().into())).is_err() { Some(id) } else { None }
            })
            .collect();

        for id in dead { self.clients.remove(&id); }
    }

    pub fn broadcast_to_user(&self, user_id: Uuid, event: &WsEvent) {
        let text = match serde_json::to_string(event) {
            Ok(t) => t,
            Err(_) => return,
        };

        let dead: Vec<Uuid> = self
            .clients
            .iter()
            .filter(|e| e.user_id == user_id)
            .filter_map(|e| {
                let id = *e.key();
                if e.tx.send(Message::Text(text.clone().into())).is_err() { Some(id) } else { None }
            })
            .collect();

        for id in dead { self.clients.remove(&id); }
    }

    pub fn broadcast_all(&self, event: &WsEvent) {
        let text = match serde_json::to_string(event) {
            Ok(t) => t,
            Err(_) => return,
        };

        let dead: Vec<Uuid> = self
            .clients
            .iter()
            .filter_map(|e| {
                let id = *e.key();
                if e.tx.send(Message::Text(text.clone().into())).is_err() { Some(id) } else { None }
            })
            .collect();

        for id in dead { self.clients.remove(&id); }
    }

    pub fn connection_count(&self) -> usize {
        self.clients.len()
    }

    pub fn room_client_count(&self, room: &str) -> usize {
        self.clients
            .iter()
            .filter(|e| e.rooms.contains(&room.to_string()))
            .count()
    }
}

impl Default for WsHub {
    fn default() -> Self { Self::new() }
}
