mod anomaly;
mod attendance;
mod audit;
mod auth;
mod bank_records;
mod billing;
mod clients;
mod config;
mod contracts;
mod dashboard;
mod departments;
mod errors;
mod events;
mod health;
mod organizations;
mod payments;
mod realtime;
mod reminders;
mod sharding;
mod state;
mod tenancy;
mod users;

use axum::{
    http::{header, HeaderName, HeaderValue, Method},
    middleware as axum_middleware,
    Router,
};
use std::sync::Arc;
use std::time::Duration;
use tokio::net::TcpListener;
use tower_http::{
    compression::CompressionLayer,
    cors::{AllowHeaders, AllowOrigin, CorsLayer},
    set_header::SetResponseHeaderLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_core=info,tower_http=warn,sqlx=warn".into()),
        )
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    let cfg = config::Config::from_env()?;
    tracing::info!("Starting rust-core v{}", env!("CARGO_PKG_VERSION"));

    let state = Arc::new(AppState::new(&cfg).await?);

    // Background: mark overdue invoices every 10 minutes
    {
        let s = Arc::clone(&state);
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(600));
            loop {
                interval.tick().await;
                match billing::engine::mark_overdue_invoices(&s).await {
                    Ok(n) if n > 0 => tracing::info!("Marked {} invoices as overdue", n),
                    Err(e) => tracing::error!("overdue-job error: {}", e),
                    _ => {}
                }
            }
        });
    }

    // Background: fire pending reminders every minute
    {
        let s = Arc::clone(&state);
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                if let Err(e) = process_due_reminders(&s).await {
                    tracing::error!("reminder-job error: {}", e);
                }
            }
        });
    }

    let app = build_router(Arc::clone(&state), &cfg);

    let addr = format!("0.0.0.0:{}", cfg.port);
    let listener = TcpListener::bind(&addr).await?;
    tracing::info!("rust-core listening on {}", addr);

    axum::serve(listener, app).await?;
    Ok(())
}

fn build_router(state: Arc<AppState>, cfg: &config::Config) -> Router {
    let origin = cfg
        .frontend_url
        .parse::<axum::http::HeaderValue>()
        .unwrap_or_else(|_| axum::http::HeaderValue::from_static("http://localhost:3000"));

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::exact(origin))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::ACCEPT,
            header::ORIGIN,
            header::ACCESS_CONTROL_REQUEST_HEADERS,
            header::ACCESS_CONTROL_REQUEST_METHOD,
        ])
        .allow_credentials(true);

    let st = Arc::clone(&state);
    let protected = Router::new()
        .nest("/users", users::routes())
        .nest("/dashboard", dashboard::routes())
        .nest("/organizations", organizations::routes())
        .nest("/clients", clients::routes())
        .nest("/departments", departments::routes())
        .nest("/contracts", contracts::routes())
        .nest("/payments", payments::routes())
        .nest("/bank-records", bank_records::routes())
        .nest("/reminders", reminders::routes())
        .nest("/attendance", attendance::routes())
        .nest("/audit", audit::routes())
        .nest("/billing", billing::routes())
        .nest("/realtime", realtime::routes())
        .nest("/anomaly", anomaly::routes())
        .route_layer(axum_middleware::from_fn_with_state(
            Arc::clone(&st),
            crate::auth::middleware::require_auth,
        ));

    Router::new()
        .nest(
            "/api/v1",
            Router::new()
                .nest("/auth", auth::routes(Arc::clone(&st)))
                .nest("/health", health::routes())
                .nest("/events", events::routes())
                .merge(protected),
        )
        // Middleware — applied outermost-last, innermost-first
        .layer(cors)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        // Security response headers
        .layer(SetResponseHeaderLayer::if_not_present(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::X_FRAME_OPTIONS,
            HeaderValue::from_static("DENY"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("referrer-policy"),
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("permissions-policy"),
            HeaderValue::from_static("geolocation=(), microphone=(), camera=()"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            HeaderName::from_static("strict-transport-security"),
            HeaderValue::from_static("max-age=63072000; includeSubDomains; preload"),
        ))
        .with_state(state)
}

async fn process_due_reminders(state: &Arc<AppState>) -> anyhow::Result<()> {
    let mut tx = state.begin_skip_rls_transaction().await?;
    let due = sqlx::query_as::<_, reminders::models::Reminder>(
        "SELECT * FROM reminders WHERE status = 'pending' AND scheduled_at <= NOW() LIMIT 50",
    )
    .fetch_all(&mut *tx)
    .await?;

    for rem in &due {
        let room = format!("org:{}", rem.org_id);
        state.ws_hub.broadcast_to_room(
            &room,
            &realtime::hub::WsEvent {
                event: "reminder.fired".into(),
                room: Some(room.clone()),
                payload: serde_json::json!({
                    "id": rem.id,
                    "type": rem.r#type,
                    "title": rem.title,
                    "message": rem.message
                }),
            },
        );

        sqlx::query(
            "UPDATE reminders SET status = 'sent', sent_at = NOW(), updated_at = NOW()
             WHERE id = $1",
        )
        .bind(rem.id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    if !due.is_empty() {
        tracing::info!("Processed {} due reminders", due.len());
    }
    Ok(())
}
