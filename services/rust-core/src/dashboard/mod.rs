use axum::{
    extract::{Extension, Query, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::models::UserProfile;
use crate::errors::AppResult;
use crate::state::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new().route("/stats", get(stats))
}

#[derive(Debug, Deserialize)]
struct StatsQuery {
    #[serde(rename = "organizationId")]
    organization_id: Option<Uuid>,
}

/// GET /api/dashboard/stats
async fn stats(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<UserProfile>,
    Query(q): Query<StatsQuery>,
) -> AppResult<Json<Value>> {
    let org_id = q.organization_id;
    let mut tx = state.tenant_tx_for(&user).await?;

    let (today_payments, today_count): (Option<i64>, Option<i64>) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount), 0)::bigint, COUNT(*)::bigint
         FROM payments
         WHERE ($1::uuid IS NULL OR org_id = $1)
           AND status = 'confirmed'
           AND payment_date >= CURRENT_DATE",
    )
    .bind(org_id)
    .fetch_one(&mut *tx)
    .await
    .unwrap_or((Some(0), Some(0)));

    let (monthly_actual, monthly_plan): (Option<i64>, Option<i64>) = sqlx::query_as(
        "SELECT
            COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0)::bigint AS collected,
            COALESCE(SUM(c.total_amount), 0)::bigint AS planned
         FROM clients c
         LEFT JOIN payments p ON p.client_id = c.id
             AND date_trunc('month', p.payment_date) = date_trunc('month', NOW())
         WHERE ($1::uuid IS NULL OR c.org_id = $1)",
    )
    .bind(org_id)
    .fetch_one(&mut *tx)
    .await
    .unwrap_or((Some(0), Some(0)));

    let monthly_actual_val = monthly_actual.unwrap_or(0);
    let monthly_plan_val = monthly_plan.unwrap_or(0).max(1);
    let monthly_percent = (monthly_actual_val * 100 / monthly_plan_val).min(100);

    let (total_clients, active_clients, total_debt): (Option<i64>, Option<i64>, Option<i64>) =
        sqlx::query_as(
            "SELECT
                COUNT(*)::bigint,
                COUNT(*) FILTER (WHERE status = 'active')::bigint,
                COALESCE(SUM(debt_amount) FILTER (WHERE debt_amount > 0), 0)::bigint
             FROM clients
             WHERE ($1::uuid IS NULL OR org_id = $1)",
        )
        .bind(org_id)
        .fetch_one(&mut *tx)
        .await
        .unwrap_or((Some(0), Some(0), Some(0)));

    let (total_orgs, active_orgs): (Option<i64>, Option<i64>) = sqlx::query_as(
        "SELECT COUNT(*)::bigint, COUNT(*) FILTER (WHERE status = 'active')::bigint FROM organizations",
    )
    .fetch_one(&mut *tx)
    .await
    .unwrap_or((Some(0), Some(0)));

    tx.commit().await?;

    Ok(Json(json!({
        "todayPayments":   today_payments.unwrap_or(0),
        "todayCount":      today_count.unwrap_or(0),
        "monthlyPlan":     monthly_plan_val,
        "monthlyActual":   monthly_actual_val,
        "monthlyPercent":  monthly_percent,
        "totalClients":    total_clients.unwrap_or(0),
        "activeClients":   active_clients.unwrap_or(0),
        "totalDebt":       total_debt.unwrap_or(0),
        "totalOrganizations":  total_orgs.unwrap_or(0),
        "activeOrganizations": active_orgs.unwrap_or(0),
        "totalRevenue":        monthly_actual_val,
    })))
}
