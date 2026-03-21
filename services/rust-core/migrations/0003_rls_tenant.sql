-- Row Level Security for role `edustatus_app` (non-superuser).
-- Superuser / postgres (default docker) bypasses RLS — unchanged until DATABASE_URL uses edustatus_app.
-- Application must run tenant queries inside a transaction and call set_config with is_local=true:
--   set_config('app.skip_tenant_rls', 'true'|'false', true)
--   set_config('app.current_org_id', '<uuid>', true)
-- See rust-core `tenancy` module.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edustatus_app') THEN
        CREATE ROLE edustatus_app WITH LOGIN PASSWORD 'edustatus_app_change_me';
    END IF;
END
$$;

COMMENT ON ROLE edustatus_app IS 'Application role with RLS; change password in production (ALTER ROLE edustatus_app PASSWORD ...)';

GRANT USAGE ON SCHEMA public TO edustatus_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO edustatus_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO edustatus_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edustatus_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO edustatus_app;

CREATE OR REPLACE FUNCTION public.app_effective_skip_tenant_rls()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
    SELECT COALESCE(NULLIF(trim(both FROM COALESCE(current_setting('app.skip_tenant_rls', true), '')), ''), '')
        IN ('true', 'on', '1');
$$;

CREATE OR REPLACE FUNCTION public.app_effective_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
    s text;
BEGIN
    s := NULLIF(trim(both FROM COALESCE(current_setting('app.current_org_id', true), '')), '');
    IF s IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN s::uuid;
EXCEPTION
    WHEN invalid_text_representation THEN
        RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.app_effective_skip_tenant_rls() TO edustatus_app;
GRANT EXECUTE ON FUNCTION public.app_effective_org_id() TO edustatus_app;

-- ─── Tenant-scoped tables (org_id) ───────────────────────────────────────────

ALTER TABLE org_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_admins FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_org_admins ON org_admins;
CREATE POLICY edustatus_org_admins ON org_admins
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_departments ON departments;
CREATE POLICY edustatus_departments ON departments
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_clients ON clients;
CREATE POLICY edustatus_clients ON clients
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_payments ON payments;
CREATE POLICY edustatus_payments ON payments
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE bank_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_bank_records ON bank_records;
CREATE POLICY edustatus_bank_records ON bank_records
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_contracts ON contracts;
CREATE POLICY edustatus_contracts ON contracts
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_reminders ON reminders;
CREATE POLICY edustatus_reminders ON reminders
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_attendance ON attendance;
CREATE POLICY edustatus_attendance ON attendance
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_custom_domains ON custom_domains;
CREATE POLICY edustatus_custom_domains ON custom_domains
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_subscriptions ON subscriptions;
CREATE POLICY edustatus_subscriptions ON subscriptions
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_invoices ON invoices;
CREATE POLICY edustatus_invoices ON invoices
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_payments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_billing_payments ON billing_payments;
CREATE POLICY edustatus_billing_payments ON billing_payments
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR org_id = public.app_effective_org_id());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_audit_logs ON audit_logs;
CREATE POLICY edustatus_audit_logs ON audit_logs
    FOR ALL TO edustatus_app
    USING (
        public.app_effective_skip_tenant_rls()
        OR (
            org_id IS NOT NULL
            AND org_id = public.app_effective_org_id()
        )
    )
    WITH CHECK (
        public.app_effective_skip_tenant_rls()
        OR (
            org_id IS NOT NULL
            AND org_id = public.app_effective_org_id()
        )
    );

-- ─── organizations: tenant row is id ─────────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_organizations ON organizations;
CREATE POLICY edustatus_organizations ON organizations
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls() OR id = public.app_effective_org_id())
    WITH CHECK (public.app_effective_skip_tenant_rls() OR id = public.app_effective_org_id());

-- ─── users (platform + per-org) ──────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_users ON users;
CREATE POLICY edustatus_users ON users
    FOR ALL TO edustatus_app
    USING (
        public.app_effective_skip_tenant_rls()
        OR role = 'super_admin'
        OR org_id IS NULL
        OR org_id = public.app_effective_org_id()
    )
    WITH CHECK (
        public.app_effective_skip_tenant_rls()
        OR role = 'super_admin'
        OR org_id IS NULL
        OR org_id = public.app_effective_org_id()
    );

-- ─── sessions: via owning user ───────────────────────────────────────────────

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_sessions ON sessions;
CREATE POLICY edustatus_sessions ON sessions
    FOR ALL TO edustatus_app
    USING (
        public.app_effective_skip_tenant_rls()
        OR EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = sessions.user_id
              AND (
                  u.role = 'super_admin'
                  OR u.org_id IS NULL
                  OR u.org_id = public.app_effective_org_id()
              )
        )
    )
    WITH CHECK (
        public.app_effective_skip_tenant_rls()
        OR EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = sessions.user_id
              AND (
                  u.role = 'super_admin'
                  OR u.org_id IS NULL
                  OR u.org_id = public.app_effective_org_id()
              )
        )
    );

-- ─── login_history ───────────────────────────────────────────────────────────

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_login_history ON login_history;
CREATE POLICY edustatus_login_history ON login_history
    FOR ALL TO edustatus_app
    USING (
        public.app_effective_skip_tenant_rls()
        OR user_id IS NULL
        OR EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = login_history.user_id
              AND (
                  u.role = 'super_admin'
                  OR u.org_id IS NULL
                  OR u.org_id = public.app_effective_org_id()
              )
        )
    )
    WITH CHECK (public.app_effective_skip_tenant_rls());

-- ─── Global / privileged tables ──────────────────────────────────────────────

ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_super_admins ON super_admins;
CREATE POLICY edustatus_super_admins ON super_admins
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls())
    WITH CHECK (public.app_effective_skip_tenant_rls());

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_plans_select ON plans;
CREATE POLICY edustatus_plans_select ON plans
    FOR SELECT TO edustatus_app
    USING (true);

DROP POLICY IF EXISTS edustatus_plans_write ON plans;
CREATE POLICY edustatus_plans_write ON plans
    FOR INSERT TO edustatus_app
    WITH CHECK (public.app_effective_skip_tenant_rls());

DROP POLICY IF EXISTS edustatus_plans_update ON plans;
CREATE POLICY edustatus_plans_update ON plans
    FOR UPDATE TO edustatus_app
    USING (public.app_effective_skip_tenant_rls())
    WITH CHECK (public.app_effective_skip_tenant_rls());

DROP POLICY IF EXISTS edustatus_plans_delete ON plans;
CREATE POLICY edustatus_plans_delete ON plans
    FOR DELETE TO edustatus_app
    USING (public.app_effective_skip_tenant_rls());

ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS edustatus_client_users ON client_users;
CREATE POLICY edustatus_client_users ON client_users
    FOR ALL TO edustatus_app
    USING (public.app_effective_skip_tenant_rls())
    WITH CHECK (public.app_effective_skip_tenant_rls());

GRANT SELECT ON client_summary TO edustatus_app;
GRANT SELECT ON org_stats TO edustatus_app;
