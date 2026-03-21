use chrono::Utc;
use uuid::Uuid;

use crate::clients::models::*;
use crate::errors::{AppError, AppResult};
use crate::state::DbTxn;

pub async fn list(tx: &mut DbTxn<'_>, q: &ClientListQuery) -> AppResult<(Vec<ClientSummary>, i64)> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 200);
    let offset = (page - 1) * limit;

    let rows = sqlx::query_as::<_, ClientSummary>(
        "SELECT
            c.id, c.org_id, c.full_name, c.phone, c.pinfl, c.status,
            c.total_amount, c.paid_amount, c.debt_amount,
            d.name AS department_name,
            COUNT(p.id) FILTER (WHERE p.status = 'confirmed')::bigint AS confirmed_payments,
            c.created_at
         FROM clients c
         LEFT JOIN departments d ON d.id = c.dept_id
         LEFT JOIN payments p ON p.client_id = c.id
         WHERE ($1::uuid IS NULL OR c.org_id  = $1)
           AND ($2::uuid IS NULL OR c.dept_id = $2)
           AND ($3::text IS NULL OR c.status  = $3)
           AND ($4::text IS NULL OR c.full_name ILIKE $4 OR c.phone ILIKE $4 OR c.pinfl ILIKE $4)
           AND ($5::bool IS NULL OR ($5 = true AND c.debt_amount > 0) OR ($5 = false AND c.debt_amount = 0))
         GROUP BY c.id, d.name
         ORDER BY c.created_at DESC
         LIMIT $6 OFFSET $7",
    )
    .bind(q.org_id)
    .bind(q.dept_id)
    .bind(&q.status)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .bind(q.has_debt)
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut **tx)
    .await?;

    let total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM clients c
         WHERE ($1::uuid IS NULL OR c.org_id  = $1)
           AND ($2::uuid IS NULL OR c.dept_id = $2)
           AND ($3::text IS NULL OR c.status  = $3)
           AND ($4::text IS NULL OR c.full_name ILIKE $4 OR c.phone ILIKE $4 OR c.pinfl ILIKE $4)
           AND ($5::bool IS NULL OR ($5 = true AND c.debt_amount > 0) OR ($5 = false AND c.debt_amount = 0))",
    )
    .bind(q.org_id)
    .bind(q.dept_id)
    .bind(&q.status)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .bind(q.has_debt)
    .fetch_one(&mut **tx)
    .await?;

    Ok((rows, total))
}

pub async fn get(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<Client> {
    sqlx::query_as::<_, Client>("SELECT * FROM clients WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut **tx)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Client {} not found", id)))
}

pub async fn create(tx: &mut DbTxn<'_>, req: &CreateClientRequest) -> AppResult<Client> {
    let org_exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1)")
        .bind(req.org_id)
        .fetch_one(&mut **tx)
        .await?;
    if !org_exists {
        return Err(AppError::NotFound("Organization not found".into()));
    }

    if let Some(pinfl) = &req.pinfl {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM clients WHERE org_id = $1 AND pinfl = $2)",
        )
        .bind(req.org_id)
        .bind(pinfl)
        .fetch_one(&mut **tx)
        .await?;
        if exists {
            return Err(AppError::Conflict(format!(
                "PINFL {} already registered in this organization",
                pinfl
            )));
        }
    }

    let client = sqlx::query_as::<_, Client>(
        "INSERT INTO clients
            (id, org_id, dept_id, pinfl, contract_number, full_name, phone,
             email, address, birth_date, total_amount, additional_info, contact_phone, contact_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(req.org_id)
    .bind(req.dept_id)
    .bind(&req.pinfl)
    .bind(&req.contract_number)
    .bind(&req.full_name)
    .bind(&req.phone)
    .bind(&req.email)
    .bind(&req.address)
    .bind(req.birth_date)
    .bind(req.total_amount.unwrap_or(0))
    .bind(&req.additional_info)
    .bind(&req.contact_phone)
    .bind(&req.contact_name)
    .fetch_one(&mut **tx)
    .await?;

    Ok(client)
}

pub async fn update(tx: &mut DbTxn<'_>, id: Uuid, req: &UpdateClientRequest) -> AppResult<Client> {
    let client = sqlx::query_as::<_, Client>(
        "UPDATE clients SET
            dept_id         = COALESCE($1,  dept_id),
            full_name       = COALESCE($2,  full_name),
            phone           = COALESCE($3,  phone),
            email           = COALESCE($4,  email),
            address         = COALESCE($5,  address),
            birth_date      = COALESCE($6,  birth_date),
            total_amount    = COALESCE($7,  total_amount),
            status          = COALESCE($8,  status),
            additional_info = COALESCE($9,  additional_info),
            contact_phone   = COALESCE($10, contact_phone),
            contact_name    = COALESCE($11, contact_name),
            updated_at      = NOW()
         WHERE id = $12
         RETURNING *",
    )
    .bind(req.dept_id)
    .bind(&req.full_name)
    .bind(&req.phone)
    .bind(&req.email)
    .bind(&req.address)
    .bind(req.birth_date)
    .bind(req.total_amount)
    .bind(&req.status)
    .bind(&req.additional_info)
    .bind(&req.contact_phone)
    .bind(&req.contact_name)
    .bind(id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Client {} not found", id)))?;

    Ok(client)
}

pub async fn delete(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<()> {
    let rows = sqlx::query("DELETE FROM clients WHERE id = $1")
        .bind(id)
        .execute(&mut **tx)
        .await?;
    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Client {} not found", id)));
    }
    Ok(())
}

pub async fn record_payment(
    tx: &mut DbTxn<'_>,
    client_id: Uuid,
    req: &RecordPaymentRequest,
) -> AppResult<serde_json::Value> {
    let client = get(tx, client_id).await?;

    let payment_date = req.payment_date.unwrap_or_else(Utc::now);

    let payment = sqlx::query_scalar::<_, Uuid>(
        "INSERT INTO payments
            (id, org_id, client_id, amount, payment_method, status, payment_date,
             description, category, reference_number)
         VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,$9)
         RETURNING id",
    )
    .bind(Uuid::new_v4())
    .bind(client.org_id)
    .bind(client_id)
    .bind(req.amount)
    .bind(&req.payment_method)
    .bind(payment_date)
    .bind(&req.description)
    .bind(&req.category)
    .bind(&req.reference_number)
    .fetch_one(&mut **tx)
    .await?;

    sqlx::query(
        "UPDATE clients SET paid_amount = paid_amount + $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(req.amount)
    .bind(client_id)
    .execute(&mut **tx)
    .await?;

    Ok(serde_json::json!({
        "payment_id": payment,
        "amount": req.amount,
        "client_id": client_id
    }))
}

pub async fn client_stats(tx: &mut DbTxn<'_>, org_id: Uuid) -> AppResult<serde_json::Value> {
    let row = sqlx::query_as::<_, (Option<i64>, Option<i64>, Option<i64>, Option<i64>, Option<i64>)>(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'active'),
            COUNT(*) FILTER (WHERE status = 'inactive'),
            COUNT(*) FILTER (WHERE debt_amount > 0),
            COALESCE(SUM(total_amount), 0),
            COALESCE(SUM(paid_amount), 0)
         FROM clients WHERE org_id = $1",
    )
    .bind(org_id)
    .fetch_one(&mut **tx)
    .await?;

    Ok(serde_json::json!({
        "active": row.0, "inactive": row.1,
        "with_debt": row.2,
        "total_contracted_tiyin": row.3,
        "total_paid_tiyin": row.4,
        "total_debt_tiyin": row.3.unwrap_or(0) - row.4.unwrap_or(0)
    }))
}
