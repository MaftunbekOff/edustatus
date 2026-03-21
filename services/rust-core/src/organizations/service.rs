use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use chrono::Utc;
use uuid::Uuid;

use crate::config::DataPlaneMode;
use crate::errors::{AppError, AppResult};
use crate::organizations::models::*;
use crate::state::{AppState, DbTxn};

pub async fn list_orgs(tx: &mut DbTxn<'_>, q: &OrgListQuery) -> AppResult<(Vec<Organization>, i64)> {
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let rows = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2::text IS NULL OR plan   = $2)
           AND ($3::uuid IS NULL OR parent_id = $3)
           AND ($4::text IS NULL OR name ILIKE $4 OR inn ILIKE $4)
         ORDER BY created_at DESC
         LIMIT $5 OFFSET $6",
    )
    .bind(&q.status)
    .bind(&q.plan)
    .bind(q.parent_id)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .bind(limit)
    .bind(offset)
    .fetch_all(&mut **tx)
    .await?;

    let total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM organizations
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2::text IS NULL OR plan   = $2)
           AND ($3::uuid IS NULL OR parent_id = $3)
           AND ($4::text IS NULL OR name ILIKE $4 OR inn ILIKE $4)",
    )
    .bind(&q.status)
    .bind(&q.plan)
    .bind(q.parent_id)
    .bind(q.search.as_ref().map(|s| format!("%{}%", s)))
    .fetch_one(&mut **tx)
    .await?;

    Ok((rows, total))
}

pub async fn get_org(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<Organization> {
    sqlx::query_as::<_, Organization>("SELECT * FROM organizations WHERE id = $1")
        .bind(id)
        .fetch_optional(&mut **tx)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Organization {} not found", id)))
}

pub async fn create_org(
    state: &AppState,
    tx: &mut DbTxn<'_>,
    req: &CreateOrgRequest,
) -> AppResult<Organization> {
    if let Some(inn) = &req.inn {
        let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM organizations WHERE inn = $1)")
            .bind(inn)
            .fetch_one(&mut **tx)
            .await?;
        if exists {
            return Err(AppError::Conflict(format!("INN {} already registered", inn)));
        }
    }

    let trial_ends_at = req
        .trial_days
        .map(|d| Utc::now() + chrono::Duration::days(d))
        .or_else(|| Some(Utc::now() + chrono::Duration::days(14)));

    let (shard_region, shard_instance) = new_org_shard_placement(state);

    let org = sqlx::query_as::<_, Organization>(
        "INSERT INTO organizations
            (id, name, inn, type, industry, is_government, region, district,
             parent_id, email, phone, address, plan, client_limit, department_limit, trial_ends_at,
             shard_region, shard_instance)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING *",
    )
    .bind(Uuid::new_v4())
    .bind(&req.name)
    .bind(&req.inn)
    .bind(req.r#type.as_deref().unwrap_or("other"))
    .bind(req.industry.as_deref().unwrap_or("other"))
    .bind(req.is_government.unwrap_or(false))
    .bind(&req.region)
    .bind(&req.district)
    .bind(req.parent_id)
    .bind(&req.email)
    .bind(&req.phone)
    .bind(&req.address)
    .bind(req.plan.as_deref().unwrap_or("basic"))
    .bind(req.client_limit.unwrap_or(100))
    .bind(req.department_limit.unwrap_or(5))
    .bind(trial_ends_at)
    .bind(shard_region.as_ref())
    .bind(shard_instance.as_ref())
    .fetch_one(&mut **tx)
    .await?;

    Ok(org)
}

fn new_org_shard_placement(state: &AppState) -> (Option<String>, Option<String>) {
    if state.config.data_plane != DataPlaneMode::Distributed {
        return (None, None);
    }
    let Some(region) = state
        .config
        .default_shard_region
        .as_ref()
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
    else {
        tracing::warn!(
            "DATA_PLANE=distributed but no shard region (set DEFAULT_SHARD_REGION or SHARD_REGIONS); shard_region left NULL"
        );
        return (None, None);
    };
    let instance = state
        .config
        .default_shard_instance
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "00-0000".to_string());
    (Some(region), Some(instance))
}

pub async fn update_org(tx: &mut DbTxn<'_>, id: Uuid, req: &UpdateOrgRequest) -> AppResult<Organization> {
    let org = sqlx::query_as::<_, Organization>(
        "UPDATE organizations SET
            name                 = COALESCE($1,  name),
            email                = COALESCE($2,  email),
            phone                = COALESCE($3,  phone),
            address              = COALESCE($4,  address),
            logo_url             = COALESCE($5,  logo_url),
            region               = COALESCE($6,  region),
            district             = COALESCE($7,  district),
            plan                 = COALESCE($8,  plan),
            status               = COALESCE($9,  status),
            client_limit         = COALESCE($10, client_limit),
            department_limit     = COALESCE($11, department_limit),
            subscription_ends_at = COALESCE($12, subscription_ends_at),
            has_bank_integration = COALESCE($13, has_bank_integration),
            has_telegram_bot     = COALESCE($14, has_telegram_bot),
            has_sms_notifications= COALESCE($15, has_sms_notifications),
            has_excel_import     = COALESCE($16, has_excel_import),
            has_pdf_reports      = COALESCE($17, has_pdf_reports),
            allow_sub_orgs       = COALESCE($18, allow_sub_orgs),
            updated_at           = NOW()
         WHERE id = $19
         RETURNING *",
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(&req.phone)
    .bind(&req.address)
    .bind(&req.logo_url)
    .bind(&req.region)
    .bind(&req.district)
    .bind(&req.plan)
    .bind(&req.status)
    .bind(req.client_limit)
    .bind(req.department_limit)
    .bind(req.subscription_ends_at)
    .bind(req.has_bank_integration)
    .bind(req.has_telegram_bot)
    .bind(req.has_sms_notifications)
    .bind(req.has_excel_import)
    .bind(req.has_pdf_reports)
    .bind(req.allow_sub_orgs)
    .bind(id)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Organization {} not found", id)))?;

    Ok(org)
}

pub async fn delete_org(tx: &mut DbTxn<'_>, id: Uuid) -> AppResult<()> {
    let rows = sqlx::query("DELETE FROM organizations WHERE id = $1")
        .bind(id)
        .execute(&mut **tx)
        .await?;
    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Organization {} not found", id)));
    }
    Ok(())
}

pub async fn list_children(tx: &mut DbTxn<'_>, parent_id: Uuid) -> AppResult<Vec<Organization>> {
    Ok(sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE parent_id = $1 ORDER BY name",
    )
    .bind(parent_id)
    .fetch_all(&mut **tx)
    .await?)
}

pub async fn list_admins(tx: &mut DbTxn<'_>, org_id: Uuid) -> AppResult<Vec<OrgAdmin>> {
    Ok(sqlx::query_as::<_, OrgAdmin>(
        "SELECT id, org_id, email, full_name, phone, role, status, last_login, created_at, updated_at
         FROM org_admins WHERE org_id = $1 ORDER BY created_at DESC",
    )
    .bind(org_id)
    .fetch_all(&mut **tx)
    .await?)
}

pub async fn create_admin(
    tx: &mut DbTxn<'_>,
    org_id: Uuid,
    req: &CreateOrgAdminRequest,
) -> AppResult<OrgAdmin> {
    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1)")
        .bind(org_id)
        .fetch_one(&mut **tx)
        .await?;
    if !exists {
        return Err(AppError::NotFound(format!("Organization {} not found", org_id)));
    }

    let email_exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM org_admins WHERE email = $1)")
        .bind(&req.email)
        .fetch_one(&mut **tx)
        .await?;
    if email_exists {
        return Err(AppError::Conflict("Email already in use".into()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
        .to_string();

    let admin = sqlx::query_as::<_, OrgAdmin>(
        "INSERT INTO org_admins (id, org_id, email, password_hash, full_name, phone, role)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, org_id, email, full_name, phone, role, status, last_login, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(org_id)
    .bind(&req.email)
    .bind(&hash)
    .bind(&req.full_name)
    .bind(&req.phone)
    .bind(req.role.as_deref().unwrap_or("admin"))
    .fetch_one(&mut **tx)
    .await?;

    Ok(admin)
}

pub async fn delete_admin(tx: &mut DbTxn<'_>, org_id: Uuid, admin_id: Uuid) -> AppResult<()> {
    let rows = sqlx::query("DELETE FROM org_admins WHERE id = $1 AND org_id = $2")
        .bind(admin_id)
        .bind(org_id)
        .execute(&mut **tx)
        .await?;
    if rows.rows_affected() == 0 {
        return Err(AppError::NotFound("Admin not found".into()));
    }
    Ok(())
}
