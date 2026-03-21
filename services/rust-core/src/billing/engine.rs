//! Core billing engine — all monetary values stored as tiyin (1 UZS = 100 tiyin)
//! using integer arithmetic to avoid floating-point rounding errors.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::billing::models::{
    BillingPayment, CreateInvoiceRequest, CreateSubscriptionRequest, Invoice, InvoiceStatus,
    Plan, Subscription, SubscriptionStatus,
};
use crate::errors::{AppError, AppResult};
use crate::state::{AppState, DbTxn};

const DEFAULT_CURRENCY: &str = "UZS";
const VAT_RATE_BP_DEFAULT: i64 = 1200;

#[inline]
fn compute_tax_tiyin(amount_tiyin: i64, rate_bp: i64) -> i64 {
    amount_tiyin * rate_bp / 10_000
}

pub async fn create_invoice(tx: &mut DbTxn<'_>, req: &CreateInvoiceRequest) -> AppResult<Invoice> {
    let currency = req.currency.clone().unwrap_or_else(|| DEFAULT_CURRENCY.to_string());
    let rate_bp = req
        .tax_rate
        .map(|r| (r * 10_000.0).round() as i64)
        .unwrap_or(VAT_RATE_BP_DEFAULT);
    let discount = req.discount_tiyin.unwrap_or(0);

    let tax_tiyin = compute_tax_tiyin(req.amount_tiyin, rate_bp);
    let total_tiyin = req.amount_tiyin + tax_tiyin - discount;

    if total_tiyin < 0 {
        return Err(AppError::Validation("Invoice total cannot be negative".into()));
    }

    let line_items = req.line_items.clone().unwrap_or_else(|| {
        serde_json::json!([{
            "description": req.description,
            "amount_tiyin": req.amount_tiyin,
            "quantity": 1
        }])
    });

    let invoice = sqlx::query_as::<_, Invoice>(
        "INSERT INTO invoices
            (id, org_id, user_id, amount_tiyin, tax_tiyin, discount_tiyin, total_tiyin,
             currency, status, description, line_items, due_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::invoice_status,$10,$11,$12)
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(req.org_id)
    .bind(req.user_id)
    .bind(req.amount_tiyin)
    .bind(tax_tiyin)
    .bind(discount)
    .bind(total_tiyin)
    .bind(&currency)
    .bind(InvoiceStatus::Pending)
    .bind(&req.description)
    .bind(&line_items)
    .bind(req.due_date)
    .fetch_one(&mut **tx)
    .await?;

    Ok(invoice)
}

pub async fn pay_invoice(
    tx: &mut DbTxn<'_>,
    invoice_id: Uuid,
    provider: &str,
    provider_payment_id: Option<String>,
) -> AppResult<BillingPayment> {
    let invoice = get_invoice_by_id(tx, invoice_id).await?;

    if invoice.status != InvoiceStatus::Pending && invoice.status != InvoiceStatus::Overdue {
        return Err(AppError::Conflict(format!(
            "Invoice cannot be paid: current status is {:?}",
            invoice.status
        )));
    }

    sqlx::query(
        "UPDATE invoices SET status = 'paid'::invoice_status, paid_at = NOW(), updated_at = NOW()
         WHERE id = $1",
    )
    .bind(invoice_id)
    .execute(&mut **tx)
    .await?;

    let payment = sqlx::query_as::<_, BillingPayment>(
        "INSERT INTO billing_payments (id, invoice_id, org_id, amount_tiyin, currency, provider, provider_payment_id, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'completed')
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(invoice_id)
    .bind(invoice.org_id)
    .bind(invoice.total_tiyin)
    .bind(&invoice.currency)
    .bind(provider)
    .bind(provider_payment_id)
    .fetch_one(&mut **tx)
    .await?;

    Ok(payment)
}

pub async fn cancel_invoice(tx: &mut DbTxn<'_>, invoice_id: Uuid) -> AppResult<Invoice> {
    let invoice = sqlx::query_as::<_, Invoice>(
        "UPDATE invoices SET status = 'cancelled'::invoice_status, updated_at = NOW()
         WHERE id = $1 AND status IN ('draft'::invoice_status,'pending'::invoice_status)
         RETURNING *",
    )
    .bind(invoice_id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Invoice cannot be cancelled in current state".into()))?;

    Ok(invoice)
}

pub async fn create_subscription(
    tx: &mut DbTxn<'_>,
    req: &CreateSubscriptionRequest,
) -> AppResult<Subscription> {
    let plan = sqlx::query_as::<_, Plan>(
        "SELECT * FROM plans WHERE id = $1 AND is_active = true",
    )
    .bind(req.plan_id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Plan not found".into()))?;

    let now = Utc::now();
    let trial_ends_at = req.trial_days.map(|d| now + chrono::Duration::days(d));
    let period_end = match plan.interval.as_str() {
        "monthly" => now + chrono::Duration::days(30),
        "yearly" => now + chrono::Duration::days(365),
        "weekly" => now + chrono::Duration::weeks(1),
        _ => now + chrono::Duration::days(30),
    };

    let status = if trial_ends_at.is_some() {
        SubscriptionStatus::Trial
    } else {
        SubscriptionStatus::Active
    };

    let sub = sqlx::query_as::<_, Subscription>(
        "INSERT INTO subscriptions
            (id, org_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
         VALUES ($1,$2,$3,$4::subscription_status,$5,$6,$7)
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(req.org_id)
    .bind(req.plan_id)
    .bind(status)
    .bind(trial_ends_at)
    .bind(now)
    .bind(period_end)
    .fetch_one(&mut **tx)
    .await?;

    Ok(sub)
}

pub async fn cancel_subscription(tx: &mut DbTxn<'_>, sub_id: Uuid) -> AppResult<Subscription> {
    let sub = sqlx::query_as::<_, Subscription>(
        "UPDATE subscriptions
         SET status = 'cancelled'::subscription_status, cancelled_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND status = 'active'::subscription_status
         RETURNING *",
    )
    .bind(sub_id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::Conflict("Subscription cannot be cancelled".into()))?;

    Ok(sub)
}

pub async fn mark_overdue_invoices(state: &AppState) -> AppResult<u64> {
    let mut tx = state.begin_skip_rls_transaction().await?;
    let result = sqlx::query(
        "UPDATE invoices
         SET status = 'overdue'::invoice_status, updated_at = NOW()
         WHERE status = 'pending'::invoice_status
           AND due_date IS NOT NULL
           AND due_date < NOW()",
    )
    .execute(&mut *tx)
    .await?;
    let n = result.rows_affected();
    tx.commit().await?;
    Ok(n)
}

pub async fn apply_late_fee(tx: &mut DbTxn<'_>, invoice_id: Uuid, fee_rate: f64) -> AppResult<Invoice> {
    let invoice = get_invoice_by_id(tx, invoice_id).await?;

    if invoice.status != InvoiceStatus::Overdue {
        return Err(AppError::Conflict(
            "Late fee only applies to overdue invoices".into(),
        ));
    }

    let fee_tiyin = ((invoice.total_tiyin as f64) * fee_rate).round() as i64;
    let new_total = invoice.total_tiyin + fee_tiyin;

    let updated = sqlx::query_as::<_, Invoice>(
        "UPDATE invoices SET total_tiyin = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    )
    .bind(new_total)
    .bind(invoice_id)
    .fetch_one(&mut **tx)
    .await?;

    Ok(updated)
}

pub async fn get_invoice_by_id(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<Invoice> {
    sqlx::query_as::<_, Invoice>("SELECT * FROM invoices WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut **tx)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Invoice {} not found", id)))
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RevenueRow {
    pub day: Option<chrono::DateTime<Utc>>,
    pub revenue_tiyin: Option<i64>,
    pub invoice_count: Option<i64>,
}

pub async fn revenue_by_period(
    tx: &mut DbTxn<'_>,
    org_id: Option<Uuid>,
    days: i32,
) -> AppResult<Vec<serde_json::Value>> {
    let rows = sqlx::query_as::<_, RevenueRow>(
        "SELECT
            DATE_TRUNC('day', paid_at)::timestamptz AS day,
            SUM(total_tiyin)                        AS revenue_tiyin,
            COUNT(*)::bigint                        AS invoice_count
         FROM invoices
         WHERE status = 'paid'::invoice_status
           AND paid_at > NOW() - ($1 * INTERVAL '1 day')
           AND ($2::uuid IS NULL OR org_id = $2)
         GROUP BY 1
         ORDER BY 1",
    )
    .bind(days)
    .bind(org_id)
    .fetch_all(&mut **tx)
    .await?;

    let result = rows
        .into_iter()
        .map(|r| {
            serde_json::json!({
                "day": r.day,
                "revenue_tiyin": r.revenue_tiyin,
                "invoice_count": r.invoice_count
            })
        })
        .collect();

    Ok(result)
}
