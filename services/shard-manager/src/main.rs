use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool, Row, Column};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

#[derive(Debug, Clone)]
pub struct ShardConnection {
    pub pool: PgPool,
    pub region: String,
    pub shard_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrganizationLocation {
    pub region: String,
    pub shard: String,
    pub schema: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedOrgId {
    pub region: String,
    pub shard: String,
    pub sequence: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryRequest {
    pub org_id: String,
    pub query: String,
    pub params: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionRequest {
    pub operations: Vec<QueryRequest>,
}

pub struct ShardManager {
    shards: HashMap<String, ShardConnection>,
    total_shards: usize,
    shards_per_region: usize,
    regions: Vec<String>,
}

impl ShardManager {
    pub async fn new() -> Result<Self, anyhow::Error> {
        let regions = parse_regions_from_env();
        let shards_per_region = env::var("SHARDS_PER_REGION")
            .ok()
            .and_then(|v| v.parse::<usize>().ok())
            .filter(|v| *v > 0)
            .unwrap_or(1);

        let mut shards = HashMap::new();

        for (region_index, region) in regions.iter().enumerate() {
            for shard_index in 0..shards_per_region {
                let shard_id = format!("{:02}-{:04}", region_index, shard_index);

                let db_host = env::var(format!("DB_HOST_{}", shard_id))
                    .unwrap_or_else(|_| env::var("DB_HOST").unwrap_or_else(|_| "postgres".to_string()));
                let db_port = env::var(format!("DB_PORT_{}", shard_id))
                    .unwrap_or_else(|_| env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string()));
                let db_name = format!("shard_{}", shard_id);
                let db_user = env::var("DB_USER").unwrap_or_else(|_| "orgstatus".to_string());
                let db_password = env::var("DB_PASSWORD").unwrap_or_default();

                let database_url = format!(
                    "postgres://{}:{}@{}:{}/{}",
                    db_user, db_password, db_host, db_port, db_name
                );

                let pool = PgPoolOptions::new()
                    .max_connections(50)
                    .connect(&database_url)
                    .await?;

                shards.insert(shard_id.clone(), ShardConnection {
                    pool,
                    region: region.clone(),
                    shard_id: shard_id.clone(),
                });
            }
        }

        let total_shards = regions.len() * shards_per_region;

        Ok(Self {
            shards,
            total_shards,
            shards_per_region,
            regions,
        })
    }

    pub fn get_shard_connection(&self, org_id: &str) -> Result<&ShardConnection, String> {
        let location = self.parse_org_id(org_id)?;
        let shard_id = format!("{}-{}", location.region, location.shard);

        self.shards.get(&shard_id)
            .ok_or_else(|| format!("Shard {} not found for organization {}", shard_id, org_id))
    }

    pub fn get_organization_location(&self, org_id: &str) -> Result<OrganizationLocation, String> {
        let parsed = self.parse_org_id(org_id)?;
        let region = self.regions.get(parsed.region.parse::<usize>().unwrap())
            .ok_or("Invalid region")?.clone();

        Ok(OrganizationLocation {
            region,
            shard: parsed.shard,
            schema: format!("org_{}", org_id.replace("-", "")),
        })
    }

    fn parse_org_id(&self, org_id: &str) -> Result<ParsedOrgId, String> {
        let parts: Vec<&str> = org_id.split('-').collect();
        if parts.len() != 3 {
            return Err(format!("Invalid organization ID format: {}", org_id));
        }

        Ok(ParsedOrgId {
            region: parts[0].to_string(),
            shard: parts[1].to_string(),
            sequence: parts[2].to_string(),
        })
    }

    pub async fn health_check(&self) -> HashMap<String, bool> {
        let mut results = HashMap::new();

        for (shard_id, connection) in &self.shards {
            let result = sqlx::query("SELECT 1")
                .execute(&connection.pool)
                .await
                .is_ok();
            results.insert(shard_id.clone(), result);
        }

        results
    }

    pub async fn execute_on_shard(&self, org_id: &str, query: &str, params: &[serde_json::Value]) -> Result<Vec<serde_json::Value>, String> {
        let connection = self.get_shard_connection(org_id)?;
        let location = self.get_organization_location(org_id)?;

        // Set search path
        let set_path = format!("SET search_path TO {}, global, public", location.schema);
        sqlx::query(&set_path)
            .execute(&connection.pool)
            .await
            .map_err(|e| format!("Failed to set search path: {}", e))?;

        // Execute query with parameters
        let mut sql_query = sqlx::query::<sqlx::Postgres>(query);
        for param in params {
            match param {
                serde_json::Value::String(s) => sql_query = sql_query.bind(s),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        sql_query = sql_query.bind(i);
                    } else if let Some(f) = n.as_f64() {
                        sql_query = sql_query.bind(f);
                    }
                }
                serde_json::Value::Bool(b) => sql_query = sql_query.bind(b),
                _ => {} // Handle other types or skip
            }
        }

        let rows = sql_query
            .fetch_all(&connection.pool)
            .await
            .map_err(|e| format!("Query failed: {}", e))?;

        // Convert rows to JSON
        let mut results = Vec::new();
        for row in rows {
            let mut map = serde_json::Map::new();
            for i in 0..row.len() {
                let column = &row.columns()[i];
                let value: serde_json::Value = {
                    // Try to get as string first
                    if let Ok(s) = row.try_get::<String, _>(i) {
                        serde_json::Value::String(s)
                    } else if let Ok(n) = row.try_get::<i64, _>(i) {
                        serde_json::Value::Number(n.into())
                    } else if let Ok(f) = row.try_get::<f64, _>(i) {
                        serde_json::Value::Number(serde_json::Number::from_f64(f).unwrap_or(serde_json::Number::from(0)))
                    } else if let Ok(b) = row.try_get::<bool, _>(i) {
                        serde_json::Value::Bool(b)
                    } else {
                        // Try as string for other types
                        if let Ok(s) = row.try_get::<String, _>(i) {
                            serde_json::Value::String(s)
                        } else {
                            serde_json::Value::Null
                        }
                    }
                };
                map.insert(column.name().to_string(), value);
            }
            results.push(serde_json::Value::Object(map));
        }

        Ok(results)
    }
}

fn parse_regions_from_env() -> Vec<String> {
    let fallback = vec!["us-east".to_string()];
    let raw = match env::var("SHARD_REGIONS") {
        Ok(v) => v,
        Err(_) => return fallback,
    };

    let regions: Vec<String> = raw
        .split(',')
        .map(|v| v.trim())
        .filter(|v| !v.is_empty())
        .map(|v| v.to_string())
        .collect();

    if regions.is_empty() {
        vec!["us-east".to_string()]
    } else {
        regions
    }
}

type SharedShardManager = Arc<Mutex<ShardManager>>;

#[derive(Serialize)]
struct ShardConnectionResponse {
    region: String,
    shard_id: String,
}

async fn get_shard_connection(
    Path(org_id): Path<String>,
    state: axum::extract::State<SharedShardManager>,
) -> Result<Json<ShardConnectionResponse>, StatusCode> {
    let manager = state.lock().await;
    match manager.get_shard_connection(&org_id) {
        Ok(conn) => Ok(Json(ShardConnectionResponse {
            region: conn.region.clone(),
            shard_id: conn.shard_id.clone(),
        })),
        Err(_) => Err(StatusCode::NOT_FOUND),
    }
}

async fn get_organization_location(
    Path(org_id): Path<String>,
    state: axum::extract::State<SharedShardManager>,
) -> Result<Json<OrganizationLocation>, StatusCode> {
    let manager = state.lock().await;
    match manager.get_organization_location(&org_id) {
        Ok(location) => Ok(Json(location)),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

async fn health_check(
    state: axum::extract::State<SharedShardManager>,
) -> Json<HashMap<String, bool>> {
    let manager = state.lock().await;
    Json(manager.health_check().await)
}

async fn execute_query(
    state: axum::extract::State<SharedShardManager>,
    Json(request): Json<QueryRequest>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    let manager = state.lock().await;
    match manager.execute_on_shard(&request.org_id, &request.query, &request.params).await {
        Ok(results) => Ok(Json(results)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::dotenv().ok();

    tracing_subscriber::fmt::init();

    let shard_manager = ShardManager::new().await?;
    let shared_manager = Arc::new(Mutex::new(shard_manager));

    let app = Router::new()
        .route("/shard/:org_id", get(get_shard_connection))
        .route("/location/:org_id", get(get_organization_location))
        .route("/health", get(health_check))
        .route("/execute", post(execute_query))
        .layer(CorsLayer::permissive())
        .with_state(shared_manager);

    let port = env::var("PORT").unwrap_or_else(|_| "8081".to_string());
    let addr = format!("0.0.0.0:{}", port);

    tracing::info!("Shard Manager listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}