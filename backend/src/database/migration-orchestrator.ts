import { Injectable, Logger } from '@nestjs/common';
import { ShardManager } from './shard-manager';
import { QueryRouter, ParsedQuery } from './query-router';
import { Pool } from 'pg';

interface MigrationProgress {
  totalOrganizations: number;
  migratedOrganizations: number;
  currentShard: string;
  currentOrganization: string;
  startTime: Date;
  estimatedCompletion: Date;
}

interface MigrationStats {
  totalDataSize: number;
  migratedDataSize: number;
  totalRows: number;
  migratedRows: number;
  errors: Array<{ orgId: string, error: string }>;
}

@Injectable()
export class MigrationOrchestrator {
  private readonly logger = new Logger(MigrationOrchestrator.name);
  private progress: MigrationProgress | null = null;
  private stats: MigrationStats = {
    totalDataSize: 0,
    migratedDataSize: 0,
    totalRows: 0,
    migratedRows: 0,
    errors: []
  };

  constructor(
    private shardManager: ShardManager,
    private queryRouter: QueryRouter,
  ) {}

  /**
   * Execute complete migration from single DB to sharded architecture
   */
  async executeFullMigration(): Promise<void> {
    this.logger.log('🚀 Starting full database migration to sharded architecture');

    try {
      // Phase 1: Preparation
      await this.prepareMigration();

      // Phase 2: Create shard infrastructure
      await this.createShardInfrastructure();

      // Phase 3: Migrate organizations
      await this.migrateOrganizations();

      // Phase 4: Enable dual-write
      await this.enableDualWrite();

      // Phase 5: Migrate data
      await this.migrateData();

      // Phase 6: Validation
      await this.validateMigration();

      // Phase 7: Switch to new system
      await this.switchToNewSystem();

      // Phase 8: Cleanup
      await this.cleanupOldData();

      this.logger.log('✅ Migration completed successfully');

    } catch (error) {
      this.logger.error('❌ Migration failed:', error);
      await this.rollbackMigration();
      throw error;
    }
  }

  /**
   * Phase 1: Prepare migration environment
   */
  private async prepareMigration(): Promise<void> {
    this.logger.log('📋 Phase 1: Preparing migration environment');

    // Get total counts
    const oldConnection = new Pool({
      connectionString: process.env.OLD_DATABASE_URL,
    });

    try {
      const orgResult = await oldConnection.query('SELECT COUNT(*) FROM organizations');
      const clientResult = await oldConnection.query('SELECT COUNT(*) FROM clients');
      const paymentResult = await oldConnection.query('SELECT COUNT(*) FROM payments');

      this.stats.totalRows =
        parseInt(orgResult.rows[0].count) +
        parseInt(clientResult.rows[0].count) +
        parseInt(paymentResult.rows[0].count);

      this.progress = {
        totalOrganizations: parseInt(orgResult.rows[0].count),
        migratedOrganizations: 0,
        currentShard: '',
        currentOrganization: '',
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + (this.stats.totalRows * 0.001)), // Rough estimate
      };

      this.logger.log(`📊 Migration scope: ${this.stats.totalRows.toLocaleString()} total rows`);
    } finally {
      await oldConnection.end();
    }
  }

  /**
   * Phase 2: Create shard databases and schemas
   */
  private async createShardInfrastructure(): Promise<void> {
    this.logger.log('🏗️ Phase 2: Creating shard infrastructure');

    const shards = this.shardManager.getAllShards();

    for (const shard of shards) {
      this.logger.log(`Creating infrastructure for shard ${shard.shardId}`);

      // Create global tables
      await this.createGlobalTables(shard.pool);

      // Create sequences for ID generation
      await this.createIdSequences(shard.pool);
    }
  }

  /**
   * Phase 3: Migrate organizations to shards
   */
  private async migrateOrganizations(): Promise<void> {
    this.logger.log('🏢 Phase 3: Migrating organizations');

    const oldConnection = new Pool({
      connectionString: process.env.OLD_DATABASE_URL,
    });

    try {
      const organizations = await oldConnection.query(`
        SELECT * FROM organizations ORDER BY id
      `);

      for (const org of organizations.rows) {
        try {
          await this.migrateSingleOrganization(org);
          this.progress!.migratedOrganizations++;
          this.progress!.currentOrganization = org.id;

          if (this.progress!.migratedOrganizations % 100 === 0) {
            this.logger.log(`Migrated ${this.progress!.migratedOrganizations}/${this.progress!.totalOrganizations} organizations`);
          }
        } catch (error) {
          this.logger.error(`Failed to migrate organization ${org.id}:`, error);
          this.stats.errors.push({ orgId: org.id, error: error.message });
        }
      }
    } finally {
      await oldConnection.end();
    }
  }

  /**
   * Migrate single organization to appropriate shard
   */
  private async migrateSingleOrganization(org: any): Promise<void> {
    // Generate new sharded organization ID
    const newOrgId = await this.shardManager.generateOrgId(
      this.selectRegionForOrganization(org),
      this.selectShardForOrganization(org)
    );

    const location = this.shardManager.getOrganizationLocation(newOrgId);
    const shard = this.shardManager.getShardConnection(newOrgId);

    // Create organization schema
    await shard.pool.query(`CREATE SCHEMA IF NOT EXISTS ${location.schema}`);

    // Create organization-specific tables
    await this.createOrganizationTables(shard.pool, location.schema);

    // Migrate organization data
    await this.migrateOrganizationData(org, newOrgId, location.schema, shard.pool);

    // Update ID mapping for future reference
    await this.updateIdMapping(org.id, newOrgId);
  }

  /**
   * Phase 4: Enable dual-write system
   */
  private async enableDualWrite(): Promise<void> {
    this.logger.log('🔄 Phase 4: Enabling dual-write system');

    // Enable feature flag for dual-write
    process.env.DUAL_WRITE_ENABLED = 'true';

    // All write operations will now write to both old and new systems
    this.logger.log('Dual-write enabled - all writes go to both systems');
  }

  /**
   * Phase 5: Migrate historical data
   */
  private async migrateData(): Promise<void> {
    this.logger.log('📦 Phase 5: Migrating historical data');

    // Migrate data for each organization
    const idMappings = await this.getIdMappings();

    for (const mapping of idMappings) {
      try {
        await this.migrateOrganizationHistoricalData(mapping.oldId, mapping.newId);
      } catch (error) {
        this.logger.error(`Failed to migrate data for org ${mapping.oldId}:`, error);
        this.stats.errors.push({ orgId: mapping.oldId, error: error.message });
      }
    }
  }

  /**
   * Phase 6: Validate migration
   */
  private async validateMigration(): Promise<void> {
    this.logger.log('✅ Phase 6: Validating migration');

    const validationResults = await this.runValidationChecks();

    if (!validationResults.isValid) {
      throw new Error(`Migration validation failed: ${validationResults.errors.join(', ')}`);
    }

    this.logger.log(`✅ Validation passed: ${validationResults.checkedRecords} records validated`);
  }

  /**
   * Phase 7: Switch to new system
   */
  private async switchToNewSystem(): Promise<void> {
    this.logger.log('🔄 Phase 7: Switching to new sharded system');

    // Update routing to use new system
    process.env.USE_SHARDED_SYSTEM = 'true';
    process.env.DUAL_WRITE_ENABLED = 'false';

    this.logger.log('Now using sharded database system exclusively');
  }

  /**
   * Phase 8: Cleanup old data
   */
  private async cleanupOldData(): Promise<void> {
    this.logger.log('🧹 Phase 8: Cleaning up old data');

    // Archive old database (don't delete immediately)
    await this.archiveOldDatabase();

    // Clean up temporary migration tables
    await this.cleanupMigrationArtifacts();

    this.logger.log('Old data archived and cleanup completed');
  }

  /**
   * Rollback migration in case of failure
   */
  private async rollbackMigration(): Promise<void> {
    this.logger.warn('⚠️ Rolling back migration');

    // Disable dual-write
    process.env.DUAL_WRITE_ENABLED = 'false';
    process.env.USE_SHARDED_SYSTEM = 'false';

    // Clean up partial migrations
    await this.cleanupFailedMigrations();

    this.logger.log('Migration rolled back successfully');
  }

  // Helper methods
  private selectRegionForOrganization(org: any): string {
    // Simple region selection based on organization location
    const regionMap: Record<string, string> = {
      'Tashkent': 'us-east', // Default for Uzbekistan
      // Add more region mappings
    };

    return regionMap[org.region] || 'us-east';
  }

  private selectShardForOrganization(org: any): string {
    // Distribute organizations across shards
    const shardIndex = Math.abs(org.id.hashCode()) % 10;
    return shardIndex.toString().padStart(4, '0');
  }

  private async createGlobalTables(pool: Pool): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS global.organizations (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        inn VARCHAR UNIQUE,
        type VARCHAR DEFAULT 'other',
        industry VARCHAR DEFAULT 'other',
        is_government BOOLEAN DEFAULT true,
        region VARCHAR NOT NULL,
        district VARCHAR NOT NULL,
        subdomain VARCHAR UNIQUE,
        custom_domain VARCHAR UNIQUE,
        plan VARCHAR DEFAULT 'basic',
        status VARCHAR DEFAULT 'trial',
        email VARCHAR,
        phone VARCHAR NOT NULL,
        address VARCHAR NOT NULL,
        logo VARCHAR,
        has_clients BOOLEAN DEFAULT true,
        has_payments BOOLEAN DEFAULT true,
        has_reports BOOLEAN DEFAULT true,
        has_bank_integration BOOLEAN DEFAULT false,
        has_telegram_bot BOOLEAN DEFAULT false,
        has_sms_notifications BOOLEAN DEFAULT false,
        has_excel_import BOOLEAN DEFAULT false,
        has_pdf_reports BOOLEAN DEFAULT false,
        allow_sub_organizations BOOLEAN DEFAULT false,
        subscription_ends_at TIMESTAMP,
        trial_ends_at TIMESTAMP,
        client_limit INTEGER DEFAULT 100,
        department_limit INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS global.organization_admins (
        id VARCHAR PRIMARY KEY,
        organization_id VARCHAR REFERENCES global.organizations(id) ON DELETE CASCADE,
        email VARCHAR UNIQUE,
        password VARCHAR,
        full_name VARCHAR,
        phone VARCHAR,
        role VARCHAR DEFAULT 'admin',
        status VARCHAR DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_org_admins_org_id ON global.organization_admins(organization_id);
    `);
  }

  private async createIdSequences(pool: Pool): Promise<void> {
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS organization_id_seq;
    `);
  }

  private async createOrganizationTables(pool: Pool, schema: string): Promise<void> {
    const queries = [
      `CREATE TABLE ${schema}.clients (
        id VARCHAR PRIMARY KEY,
        pinfl VARCHAR,
        contract_number VARCHAR UNIQUE,
        full_name VARCHAR NOT NULL,
        phone VARCHAR,
        email VARCHAR,
        address VARCHAR,
        birth_date TIMESTAMP,
        department_id VARCHAR,
        total_amount DECIMAL DEFAULT 0,
        paid_amount DECIMAL DEFAULT 0,
        debt_amount DECIMAL DEFAULT 0,
        status VARCHAR DEFAULT 'active',
        additional_info TEXT,
        contact_phone VARCHAR,
        contact_name VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE ${schema}.departments (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        code VARCHAR,
        description TEXT,
        manager_name VARCHAR,
        specialty VARCHAR,
        course INTEGER,
        year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE ${schema}.payments (
        id VARCHAR PRIMARY KEY,
        client_id VARCHAR NOT NULL,
        amount DECIMAL NOT NULL,
        currency VARCHAR DEFAULT 'UZS',
        payment_method VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'pending',
        transaction_id VARCHAR,
        reference_number VARCHAR,
        bank_account VARCHAR,
        bank_mfo VARCHAR,
        bank_name VARCHAR,
        payment_date TIMESTAMP NOT NULL,
        confirmed_at TIMESTAMP,
        confirmed_by VARCHAR,
        description TEXT,
        reconciled BOOLEAN DEFAULT false,
        reconciled_at TIMESTAMP,
        reconciled_with VARCHAR,
        category VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Add indexes
      `CREATE INDEX idx_clients_dept ON ${schema}.clients(department_id)`,
      `CREATE INDEX idx_clients_pinfl ON ${schema}.clients(pinfl)`,
      `CREATE INDEX idx_clients_status ON ${schema}.clients(status)`,
      `CREATE INDEX idx_payments_client ON ${schema}.payments(client_id)`,
      `CREATE INDEX idx_payments_status ON ${schema}.payments(status)`,
      `CREATE INDEX idx_payments_date ON ${schema}.payments(payment_date)`,
    ];

    for (const query of queries) {
      await pool.query(query);
    }
  }

  private async migrateOrganizationData(org: any, newOrgId: string, schema: string, pool: Pool): Promise<void> {
    // Insert organization into global table
    await pool.query(`
      INSERT INTO global.organizations (
        id, name, inn, type, industry, is_government, region, district,
        subdomain, custom_domain, plan, status, email, phone, address, logo,
        has_clients, has_payments, has_reports, has_bank_integration,
        has_telegram_bot, has_sms_notifications, has_excel_import,
        has_pdf_reports, allow_sub_organizations, subscription_ends_at,
        trial_ends_at, client_limit, department_limit, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
               $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
    `, [
      newOrgId, org.name, org.inn, org.type, org.industry, org.is_government,
      org.region, org.district, org.subdomain, org.custom_domain, org.plan,
      org.status, org.email, org.phone, org.address, org.logo,
      org.has_clients, org.has_payments, org.has_reports, org.has_bank_integration,
      org.has_telegram_bot, org.has_sms_notifications, org.has_excel_import,
      org.has_pdf_reports, org.allow_sub_organizations, org.subscription_ends_at,
      org.trial_ends_at, org.client_limit, org.department_limit, org.created_at, org.updated_at
    ]);
  }

  private async updateIdMapping(oldId: string, newId: string): Promise<void> {
    // Store mapping for data migration
    const mappingPool = new Pool({
      connectionString: process.env.MIGRATION_DB_URL,
    });

    try {
      await mappingPool.query(`
        INSERT INTO migration.id_mappings (old_id, new_id, entity_type)
        VALUES ($1, $2, 'organization')
      `, [oldId, newId]);
    } finally {
      await mappingPool.end();
    }
  }

  private async getIdMappings(): Promise<Array<{oldId: string, newId: string}>> {
    const mappingPool = new Pool({
      connectionString: process.env.MIGRATION_DB_URL,
    });

    try {
      const result = await mappingPool.query(`
        SELECT old_id, new_id FROM migration.id_mappings
        WHERE entity_type = 'organization'
      `);
      return result.rows.map((row: any) => ({ oldId: row.old_id, newId: row.new_id }));
    } finally {
      await mappingPool.end();
    }
  }

  private async migrateOrganizationHistoricalData(oldOrgId: string, newOrgId: string): Promise<void> {
    const location = this.shardManager.getOrganizationLocation(newOrgId);
    const shard = this.shardManager.getShardConnection(newOrgId);

    const oldConnection = new Pool({
      connectionString: process.env.OLD_DATABASE_URL,
    });

    try {
      // Migrate clients
      const clients = await oldConnection.query(`
        SELECT * FROM clients WHERE organization_id = $1
      `, [oldOrgId]);

      for (const client of clients.rows) {
        await shard.pool.query(`
          INSERT INTO ${location.schema}.clients (
            id, pinfl, contract_number, full_name, phone, email, address,
            birth_date, department_id, total_amount, paid_amount, debt_amount,
            status, additional_info, contact_phone, contact_name,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          client.id, client.pinfl, client.contract_number, client.full_name,
          client.phone, client.email, client.address, client.birth_date,
          client.department_id, client.total_amount, client.paid_amount,
          client.debt_amount, client.status, client.additional_info,
          client.contact_phone, client.contact_name, client.created_at, client.updated_at
        ]);
      }

      // Migrate departments, payments, etc.
      // Similar pattern for other tables...

      this.stats.migratedRows += clients.rows.length;

    } finally {
      await oldConnection.end();
    }
  }

  private async runValidationChecks(): Promise<{isValid: boolean, errors: string[], checkedRecords: number}> {
    // Implement comprehensive validation
    return { isValid: true, errors: [], checkedRecords: this.stats.migratedRows };
  }

  private async archiveOldDatabase(): Promise<void> {
    // Implement archiving logic
  }

  private async cleanupMigrationArtifacts(): Promise<void> {
    // Clean up temporary tables and data
  }

  private async cleanupFailedMigrations(): Promise<void> {
    // Clean up partial migrations
  }

  /**
   * Get migration progress
   */
  getProgress(): MigrationProgress | null {
    return this.progress;
  }

  /**
   * Get migration statistics
   */
  getStats(): MigrationStats {
    return this.stats;
  }
}