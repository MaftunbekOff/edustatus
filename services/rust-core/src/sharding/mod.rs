//! Horizontal scaling: shard-manager + query-router integration points.
//!
//! **Direct** mode: `rust-core` uses `DATABASE_URL` only (typical single Postgres).
//! **Distributed** mode: production checks also probe `shard-manager` and `query-router`;
//! tenant rows should set `organizations.shard_region` / `organizations.shard_instance`
//! to match routing (see migration `0002_org_shard_placement.sql`).

use std::time::Duration;

use reqwest::Client;

pub async fn probe_health_endpoint(http: &Client, base_url: &str) -> bool {
    probe_health_url(http, base_url, "/health").await
}

async fn probe_health_url(http: &Client, base: &str, path: &str) -> bool {
    let base = base.trim_end_matches('/');
    let url = format!("{base}{path}");
    http.get(url)
        .timeout(Duration::from_secs(2))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false)
}
