-- ============================================================
-- EduStatus — Full schema (Prisma/NestJS replaced by Rust Core)
-- All IDs: UUID, monetary values: BIGINT tiyin (1 UZS = 100 tiyin)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Full-text search

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE invoice_status      AS ENUM ('draft','pending','paid','overdue','cancelled','refunded');
CREATE TYPE subscription_status AS ENUM ('active','cancelled','expired','paused','trial');
CREATE TYPE org_status          AS ENUM ('trial','active','suspended','cancelled');
CREATE TYPE org_plan            AS ENUM ('basic','pro','enterprise');
CREATE TYPE org_type            AS ENUM ('education','medical','service','retail','manufacturing','other');
CREATE TYPE payment_status      AS ENUM ('pending','confirmed','rejected','cancelled');
CREATE TYPE bank_record_status  AS ENUM ('new','matched','unmatched','ignored');
CREATE TYPE reminder_status     AS ENUM ('pending','sent','failed','cancelled');
CREATE TYPE attendance_status   AS ENUM ('present','absent','late','excused');
CREATE TYPE contract_status     AS ENUM ('active','completed','cancelled');
CREATE TYPE domain_status       AS ENUM ('pending','verifying','active','failed');
CREATE TYPE user_role           AS ENUM ('super_admin','admin','accountant','manager','operator','user');

-- ─── Super Admin ──────────────────────────────────────────────────────────────

CREATE TABLE super_admins (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'super_admin',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Users (unified table) ────────────────────────────────────────────────────

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    phone         TEXT,
    role          TEXT NOT NULL DEFAULT 'user',
    org_id        UUID,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    is_verified   BOOLEAN NOT NULL DEFAULT false,
    avatar_url    TEXT,
    metadata      JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_role   ON users(role);

-- ─── Sessions ─────────────────────────────────────────────────────────────────

CREATE TABLE sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_jti UUID NOT NULL UNIQUE,
    user_agent        TEXT,
    ip_address        TEXT,
    device_type       TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at        TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_active  ON sessions(user_id, is_active) WHERE is_active = true;

-- ─── Login History ────────────────────────────────────────────────────────────

CREATE TABLE login_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address     TEXT,
    user_agent     TEXT,
    device_type    TEXT,
    browser        TEXT,
    os             TEXT,
    success        BOOLEAN NOT NULL DEFAULT false,
    failure_reason TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created ON login_history(created_at DESC);

-- ─── Organizations (Tashkilotlar) ─────────────────────────────────────────────

CREATE TABLE organizations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    inn            TEXT UNIQUE,          -- Soliq ID (9 raqam)
    type           org_type NOT NULL DEFAULT 'other',
    industry       TEXT NOT NULL DEFAULT 'other',
    is_government  BOOLEAN NOT NULL DEFAULT false,
    region         TEXT,
    district       TEXT,
    parent_id      UUID REFERENCES organizations(id) ON DELETE SET NULL,
    subdomain      TEXT UNIQUE,
    custom_domain  TEXT UNIQUE,
    plan           org_plan NOT NULL DEFAULT 'basic',
    status         org_status NOT NULL DEFAULT 'trial',
    email          TEXT,
    phone          TEXT,
    address        TEXT,
    logo_url       TEXT,

    -- Features flags
    has_clients            BOOLEAN NOT NULL DEFAULT true,
    has_payments           BOOLEAN NOT NULL DEFAULT true,
    has_reports            BOOLEAN NOT NULL DEFAULT true,
    has_bank_integration   BOOLEAN NOT NULL DEFAULT false,
    has_telegram_bot       BOOLEAN NOT NULL DEFAULT false,
    has_sms_notifications  BOOLEAN NOT NULL DEFAULT false,
    has_excel_import       BOOLEAN NOT NULL DEFAULT false,
    has_pdf_reports        BOOLEAN NOT NULL DEFAULT false,
    allow_sub_orgs         BOOLEAN NOT NULL DEFAULT false,

    -- Limits
    client_limit     INT NOT NULL DEFAULT 100,
    department_limit INT NOT NULL DEFAULT 5,

    subscription_ends_at TIMESTAMPTZ,
    trial_ends_at        TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_inn       ON organizations(inn);
CREATE INDEX idx_orgs_parent_id ON organizations(parent_id);
CREATE INDEX idx_orgs_status    ON organizations(status);

-- ─── Organization Admins ──────────────────────────────────────────────────────

CREATE TABLE org_admins (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    phone       TEXT,
    role        TEXT NOT NULL DEFAULT 'admin', -- admin, accountant, manager, operator
    status      TEXT NOT NULL DEFAULT 'active',
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_admins_org_id ON org_admins(org_id);
CREATE INDEX idx_org_admins_email  ON org_admins(email);

-- ─── Departments (Bo'limlar / Guruhlar) ───────────────────────────────────────

CREATE TABLE departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT,
    description TEXT,
    manager_name TEXT,
    specialty   TEXT,         -- Ta'lim uchun
    course      INT,
    year        INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, name)
);

CREATE INDEX idx_departments_org_id ON departments(org_id);

-- ─── Clients (Mijozlar / Talabalar) ───────────────────────────────────────────

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dept_id         UUID REFERENCES departments(id) ON DELETE SET NULL,
    pinfl           TEXT,                    -- 14 raqamli shaxsiy ID
    contract_number TEXT UNIQUE,
    full_name       TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    birth_date      DATE,

    -- Financial (tiyin)
    total_amount BIGINT NOT NULL DEFAULT 0,
    paid_amount  BIGINT NOT NULL DEFAULT 0,
    debt_amount  BIGINT NOT NULL GENERATED ALWAYS AS (total_amount - paid_amount) STORED,

    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive, archived

    -- Extra
    additional_info JSONB,
    contact_phone   TEXT,
    contact_name    TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, pinfl)
);

CREATE INDEX idx_clients_org_id  ON clients(org_id);
CREATE INDEX idx_clients_pinfl   ON clients(pinfl);
CREATE INDEX idx_clients_dept_id ON clients(dept_id);
CREATE INDEX idx_clients_status  ON clients(org_id, status);
CREATE INDEX idx_clients_name_trgm ON clients USING gin(full_name gin_trgm_ops);

-- ─── Payments ─────────────────────────────────────────────────────────────────

CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount           BIGINT NOT NULL CHECK (amount > 0), -- tiyin
    currency         TEXT NOT NULL DEFAULT 'UZS',
    payment_method   TEXT NOT NULL, -- bank, cash, click, payme, card, transfer, other
    status           payment_status NOT NULL DEFAULT 'pending',

    -- Bank details
    transaction_id   TEXT,
    reference_number TEXT,
    bank_account     TEXT,
    bank_mfo         TEXT,
    bank_name        TEXT,

    -- Dates
    payment_date  TIMESTAMPTZ NOT NULL,
    confirmed_at  TIMESTAMPTZ,
    confirmed_by  UUID REFERENCES users(id),

    description   TEXT,
    category      TEXT, -- tuition, service, product, subscription, other

    -- Reconciliation
    reconciled    BOOLEAN NOT NULL DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    reconciled_with TEXT,  -- bank_record id

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_org_id     ON payments(org_id);
CREATE INDEX idx_payments_client_id  ON payments(client_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_date       ON payments(org_id, status, payment_date DESC);

-- ─── Bank Records (Bank ko'chirmalari) ───────────────────────────────────────

CREATE TABLE bank_records (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id   TEXT NOT NULL UNIQUE,
    amount           BIGINT NOT NULL,  -- tiyin
    currency         TEXT NOT NULL DEFAULT 'UZS',
    sender_account   TEXT,
    sender_name      TEXT,
    sender_mfo       TEXT,
    receiver_account TEXT,
    receiver_mfo     TEXT,
    purpose          TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,

    -- Reconciliation
    status           bank_record_status NOT NULL DEFAULT 'new',
    matched_with     UUID REFERENCES payments(id),
    matched_at       TIMESTAMPTZ,

    imported_from    TEXT,
    imported_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_records_org_id ON bank_records(org_id);
CREATE INDEX idx_bank_records_status ON bank_records(status);
CREATE INDEX idx_bank_records_date   ON bank_records(transaction_date DESC);

-- ─── Contracts (Shartnomalar) ─────────────────────────────────────────────────

CREATE TABLE contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_number TEXT NOT NULL UNIQUE,
    contract_date   DATE NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    amount          BIGINT NOT NULL,  -- tiyin
    payment_schedule JSONB,
    document_url    TEXT,
    status          contract_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_org_id    ON contracts(org_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_status    ON contracts(status);

-- ─── Reminders (Eslatmalar) ───────────────────────────────────────────────────

CREATE TABLE reminders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,  -- payment, debt, deadline, custom
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    target_type TEXT NOT NULL,  -- all, department, client
    target_id   UUID,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at     TIMESTAMPTZ,
    status      reminder_status NOT NULL DEFAULT 'pending',
    send_sms      BOOLEAN NOT NULL DEFAULT false,
    send_email    BOOLEAN NOT NULL DEFAULT false,
    send_telegram BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_org_id      ON reminders(org_id);
CREATE INDEX idx_reminders_status      ON reminders(status);
CREATE INDEX idx_reminders_scheduled   ON reminders(scheduled_at) WHERE status = 'pending';

-- ─── Attendance (Davomat) ─────────────────────────────────────────────────────

CREATE TABLE attendance (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    status      attendance_status NOT NULL,
    note        TEXT,
    scanned_at  TIMESTAMPTZ,
    scanned_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, date)
);

CREATE INDEX idx_attendance_org_id    ON attendance(org_id);
CREATE INDEX idx_attendance_client_id ON attendance(client_id);
CREATE INDEX idx_attendance_date      ON attendance(date DESC);

-- ─── Custom Domains ───────────────────────────────────────────────────────────

CREATE TABLE custom_domains (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain              TEXT NOT NULL UNIQUE,
    is_primary          BOOLEAN NOT NULL DEFAULT false,
    status              domain_status NOT NULL DEFAULT 'pending',
    verification_token  TEXT,
    verified_at         TIMESTAMPTZ,
    ssl_status          TEXT NOT NULL DEFAULT 'pending',
    ssl_provisioned_at  TIMESTAMPTZ,
    last_error          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custom_domains_org_id ON custom_domains(org_id);

-- ─── Client Users (Mijoz portali foydalanuvchilari) ──────────────────────────

CREATE TABLE client_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    linked_clients  UUID[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Billing: Plans / Invoices / Payments ─────────────────────────────────────

CREATE TABLE plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    price_tiyin BIGINT NOT NULL CHECK (price_tiyin >= 0),
    currency    TEXT NOT NULL DEFAULT 'UZS',
    interval    TEXT NOT NULL DEFAULT 'monthly',
    features    JSONB NOT NULL DEFAULT '[]',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id               UUID NOT NULL,
    plan_id              UUID NOT NULL REFERENCES plans(id),
    status               subscription_status NOT NULL DEFAULT 'active',
    trial_ends_at        TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancelled_at         TIMESTAMPTZ,
    metadata             JSONB,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL,
    user_id         UUID REFERENCES users(id),
    amount_tiyin    BIGINT NOT NULL CHECK (amount_tiyin >= 0),
    tax_tiyin       BIGINT NOT NULL DEFAULT 0,
    discount_tiyin  BIGINT NOT NULL DEFAULT 0,
    total_tiyin     BIGINT NOT NULL CHECK (total_tiyin >= 0),
    currency        TEXT NOT NULL DEFAULT 'UZS',
    status          invoice_status NOT NULL DEFAULT 'pending',
    description     TEXT,
    line_items      JSONB NOT NULL DEFAULT '[]',
    due_date        TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_org_id   ON invoices(org_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_paid_at  ON invoices(paid_at) WHERE paid_at IS NOT NULL;

CREATE TABLE billing_payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id          UUID NOT NULL REFERENCES invoices(id),
    org_id              UUID NOT NULL,
    amount_tiyin        BIGINT NOT NULL CHECK (amount_tiyin > 0),
    currency            TEXT NOT NULL DEFAULT 'UZS',
    provider            TEXT NOT NULL,
    provider_payment_id TEXT,
    status              TEXT NOT NULL DEFAULT 'pending',
    metadata            JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_payments_invoice ON billing_payments(invoice_id);
CREATE INDEX idx_billing_payments_org     ON billing_payments(org_id);

-- ─── Audit Log ────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID,
    user_id     UUID,
    action      TEXT NOT NULL,   -- create, update, delete, login, logout, etc.
    entity      TEXT NOT NULL,   -- Organization, Client, Payment, etc.
    entity_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org_id    ON audit_logs(org_id);
CREATE INDEX idx_audit_user_id   ON audit_logs(user_id);
CREATE INDEX idx_audit_entity    ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created   ON audit_logs(created_at DESC);

-- ─── Default Super Admin (password set via SUPER_ADMIN_PASSWORD env) ─────────
-- Password is set by the application on first startup via /api/v1/setup

-- ─── Useful views ─────────────────────────────────────────────────────────────

CREATE VIEW client_summary AS
SELECT
    c.id,
    c.org_id,
    c.full_name,
    c.phone,
    c.pinfl,
    c.status,
    c.total_amount,
    c.paid_amount,
    c.debt_amount,
    d.name AS department_name,
    COUNT(p.id) FILTER (WHERE p.status = 'confirmed') AS confirmed_payments,
    c.created_at
FROM clients c
LEFT JOIN departments d ON d.id = c.dept_id
LEFT JOIN payments p ON p.client_id = c.id
GROUP BY c.id, d.name;

CREATE VIEW org_stats AS
SELECT
    o.id,
    o.name,
    o.status,
    o.plan,
    COUNT(DISTINCT c.id)  AS client_count,
    COUNT(DISTINCT d.id)  AS dept_count,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0) AS total_collected
FROM organizations o
LEFT JOIN clients c ON c.org_id = o.id AND c.status = 'active'
LEFT JOIN departments d ON d.org_id = o.id
LEFT JOIN payments p ON p.org_id = o.id
GROUP BY o.id;
