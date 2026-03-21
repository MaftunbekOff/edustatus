use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;

use crate::config::DataPlaneMode;
use crate::sharding;
use crate::state::AppState;

static START_TIME: once_cell::sync::Lazy<std::time::Instant> =
    once_cell::sync::Lazy::new(std::time::Instant::now);

pub async fn liveness() -> impl IntoResponse {
    Json(json!({ "status": "ok", "service": "rust-core" }))
}

pub async fn readiness(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let db_ok = sqlx::query("SELECT 1")
        .execute(&state.db)
        .await
        .is_ok();

    let redis_ok = {
        let mut r = state.redis.clone();
        redis::cmd("PING")
            .query_async::<String>(&mut r)
            .await
            .is_ok()
    };

    if db_ok && redis_ok {
        (StatusCode::OK, Json(json!({ "status": "ready" }))).into_response()
    } else {
        (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({
                "status": "not_ready",
                "checks": {
                    "database": if db_ok { "ok" } else { "error" },
                    "redis":    if redis_ok { "ok" } else { "error" }
                }
            })),
        ).into_response()
    }
}

pub async fn health_full(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let uptime = START_TIME.elapsed();

    let db_ok = sqlx::query("SELECT 1").execute(&state.db).await.is_ok();
    let redis_ok = {
        let mut r = state.redis.clone();
        redis::cmd("PING").query_async::<String>(&mut r).await.is_ok()
    };

    // Probe go-connectors
    let connectors_ok = state
        .http
        .get(format!("{}/health/live", state.config.go_connectors_url))
        .timeout(Duration::from_secs(2))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false);

    let (query_router_check, shard_manager_check) =
        if state.config.data_plane == DataPlaneMode::Distributed {
            let qr_ok = sharding::probe_health_endpoint(&state.http, &state.config.query_router_url)
                .await;
            let query_router_check = if qr_ok { "ok" } else { "unreachable" };
            let shard_manager_check = match state.config.shard_manager_url.as_deref() {
                Some(sm) if !sm.is_empty() => {
                    if sharding::probe_health_endpoint(&state.http, sm).await {
                        "ok"
                    } else {
                        "unreachable"
                    }
                }
                _ => "not_configured",
            };
            (query_router_check, shard_manager_check)
        } else {
            ("skipped", "skipped")
        };

    let mem = {
        #[cfg(target_os = "linux")]
        {
            std::fs::read_to_string("/proc/self/status")
                .ok()
                .and_then(|s| {
                    s.lines()
                        .find(|l| l.starts_with("VmRSS:"))
                        .and_then(|l| l.split_whitespace().nth(1))
                        .and_then(|v| v.parse::<u64>().ok())
                })
                .map(|kb| kb * 1024)
                .unwrap_or(0)
        }
        #[cfg(not(target_os = "linux"))]
        0u64
    };

    let distributed_degraded = state.config.data_plane == DataPlaneMode::Distributed
        && (query_router_check != "ok" || shard_manager_check != "ok");

    let overall = if !db_ok || !redis_ok {
        "degraded"
    } else if distributed_degraded {
        "degraded"
    } else {
        "ok"
    };

    let data_plane_label = match state.config.data_plane {
        DataPlaneMode::Direct => "direct",
        DataPlaneMode::Distributed => "distributed",
    };

    Json(json!({
        "status": overall,
        "service": "rust-core",
        "version": env!("CARGO_PKG_VERSION"),
        "data_plane": data_plane_label,
        "uptime_secs": uptime.as_secs(),
        "ws_connections": state.ws_hub.connection_count(),
        "memory_bytes": mem,
        "checks": {
            "database":   if db_ok { "ok" } else { "error" },
            "redis":      if redis_ok { "ok" } else { "error" },
            "connectors": if connectors_ok { "ok" } else { "unreachable" },
            "query_router": query_router_check,
            "shard_manager": shard_manager_check
        }
    }))
}

pub async fn metrics(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    // Prometheus-style plain text metrics
    let ws_conns = state.ws_hub.connection_count();
    let db_pool = state.db.size();
    let db_idle = state.db.num_idle();

    let body = format!(
        "# HELP ws_connections Active WebSocket connections\n\
         # TYPE ws_connections gauge\n\
         ws_connections {}\n\
         # HELP db_pool_size DB pool total size\n\
         # TYPE db_pool_size gauge\n\
         db_pool_size {}\n\
         # HELP db_pool_idle DB pool idle connections\n\
         # TYPE db_pool_idle gauge\n\
         db_pool_idle {}\n",
        ws_conns, db_pool, db_idle
    );

    (
        StatusCode::OK,
        [(axum::http::header::CONTENT_TYPE, "text/plain; version=0.0.4")],
        body,
    )
}
