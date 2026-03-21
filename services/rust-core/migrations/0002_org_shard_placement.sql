-- Shard routing metadata for horizontal scale (multi-tenant isolation at placement level).
-- Used with shard-manager / query-router: each organization can be pinned to a region + shard.
-- NULL = single-database mode (default until migration to distributed plane).

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS shard_region TEXT,
    ADD COLUMN IF NOT EXISTS shard_instance TEXT;

COMMENT ON COLUMN organizations.shard_region IS
    'Logical region for data residency and routing (e.g. uz-tashkent). Must align with SHARD_REGIONS.';

COMMENT ON COLUMN organizations.shard_instance IS
    'Physical shard id within the region (e.g. 00-0000). Must match shard-manager topology.';

CREATE INDEX IF NOT EXISTS idx_organizations_shard_placement
    ON organizations (shard_region, shard_instance)
    WHERE shard_region IS NOT NULL AND shard_instance IS NOT NULL;
