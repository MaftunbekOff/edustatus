#!/usr/bin/env ts-node

/**
 * Initialize Distributed Database Infrastructure
 * This script sets up the sharded database architecture for 12M organizations
 */

import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

interface ShardConfig {
  id: string;
  region: string;
  host: string;
  port: number;
  database: string;
}

class DistributedDBInitializer {
  private masterPool: Pool;

  constructor() {
    this.masterPool = new Pool({
      host: process.env.DB_MASTER_HOST || 'localhost',
      port: parseInt(process.env.DB_MASTER_PORT || '5432'),
      database: process.env.DB_MASTER_DATABASE || 'postgres',
      user: process.env.DB_MASTER_USER || 'postgres',
      password: process.env.DB_MASTER_PASSWORD,
    });
  }

  async initialize() {
    console.log('🚀 Initializing distributed database infrastructure...');

    try {
      // Create all shards
      await this.createAllShards();

      // Initialize global schemas on each shard
      await this.initializeGlobalSchemas();

      // Create shard routing table
      await this.createShardRoutingTable();

      // Initialize sequences and functions
      await this.createSharedFunctions();

      console.log('✅ Distributed database initialization completed!');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    } finally {
      await this.masterPool.end();
    }
  }

  private async createAllShards() {
    console.log('🏗️ Creating database shards...');

    const regions = [
      'us-east', 'us-west', 'eu-west', 'eu-central',
      'ap-south', 'ap-southeast', 'ap-northeast',
      'me-south', 'af-south', 'sa-east'
    ];

    const shards: ShardConfig[] = [];

    for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
      const region = regions[regionIndex];

      for (let shardIndex = 0; shardIndex < 5; shardIndex++) { // 5 shards per region = 50 total
        const globalShardId = regionIndex * 5 + shardIndex;
        const shardId = `${regionIndex.toString().padStart(2, '0')}-${shardIndex.toString().padStart(4, '0')}`;

        const host = process.env[`DB_HOST_${shardId}`] || `db-${region}-${shardIndex}.cluster.local`;
        const port = parseInt(process.env[`DB_PORT_${shardId}`] || '5432');
        const database = `shard_${shardId}`;

        shards.push({
          id: shardId,
          region,
          host,
          port,
          database
        });

        // Create database if it doesn't exist
        await this.masterPool.query(`
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = $1;
        `, [database]);

        await this.masterPool.query(`DROP DATABASE IF EXISTS ${database}`);
        await this.masterPool.query(`CREATE DATABASE ${database}`);

        console.log(`✅ Created shard ${shardId} (${database})`);
      }
    }

    // Save shard configuration
    await this.saveShardConfig(shards);
  }

  private async initializeGlobalSchemas() {
    console.log('📋 Initializing global schemas on all shards...');

    const shardConfigs = await this.getShardConfigs();

    for (const shard of shardConfigs) {
      const shardPool = new Pool({
        host: shard.host,
        port: shard.port,
        database: shard.database,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      try {
        // Create global schema
        await shardPool.query(`CREATE SCHEMA IF NOT EXISTS global`);

        // Create global tables
        await this.createGlobalTables(shardPool);

        // Create sequences
        await shardPool.query(`
          CREATE SEQUENCE IF NOT EXISTS global.organization_id_seq;
          CREATE SEQUENCE IF NOT EXISTS global.migration_id_seq;
        `);

        console.log(`✅ Initialized global schema for shard ${shard.id}`);
      } finally {
        await shardPool.end();
      }
    }
  }

  private async createGlobalTables(pool: Pool) {
    const queries = [
      // Organizations table
      `CREATE TABLE IF NOT EXISTS global.organizations (
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
      )`,

      // Organization admins table
      `CREATE TABLE IF NOT EXISTS global.organization_admins (
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
      )`,

      // Audit logs table
      `CREATE TABLE IF NOT EXISTS global.audit_logs (
        id VARCHAR PRIMARY KEY,
        organization_id VARCHAR,
        user_id VARCHAR,
        action VARCHAR NOT NULL,
        entity VARCHAR NOT NULL,
        entity_id VARCHAR,
        old_value TEXT,
        new_value TEXT,
        ip_address VARCHAR,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Migration mappings table
      `CREATE TABLE IF NOT EXISTS global.migration_mappings (
        id VARCHAR PRIMARY KEY,
        entity_type VARCHAR NOT NULL,
        old_id VARCHAR NOT NULL,
        new_id VARCHAR NOT NULL,
        shard_id VARCHAR NOT NULL,
        schema_name VARCHAR NOT NULL,
        migrated_at TIMESTAMP,
        status VARCHAR DEFAULT 'pending',
        error TEXT,
        UNIQUE(entity_type, old_id)
      )`,

      // Indexes
      `CREATE INDEX IF NOT EXISTS idx_org_admins_org_id ON global.organization_admins(organization_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON global.audit_logs(organization_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON global.audit_logs(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_migration_status ON global.migration_mappings(status)`,
    ];

    for (const query of queries) {
      await pool.query(query);
    }
  }

  private async createShardRoutingTable() {
    console.log('🗺️ Creating shard routing table...');

    await this.masterPool.query(`
      CREATE TABLE IF NOT EXISTS shard_routing (
        shard_id VARCHAR PRIMARY KEY,
        region VARCHAR NOT NULL,
        host VARCHAR NOT NULL,
        port INTEGER NOT NULL,
        database VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'active',
        capacity INTEGER DEFAULT 1200000, -- 1.2M organizations per shard
        current_load INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_health_check TIMESTAMP
      )
    `);

    const shardConfigs = await this.getShardConfigs();
    for (const shard of shardConfigs) {
      await this.masterPool.query(`
        INSERT INTO shard_routing (shard_id, region, host, port, database)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (shard_id) DO UPDATE SET
          region = EXCLUDED.region,
          host = EXCLUDED.host,
          port = EXCLUDED.port,
          database = EXCLUDED.database,
          last_health_check = CURRENT_TIMESTAMP
      `, [shard.id, shard.region, shard.host, shard.port, shard.database]);
    }
  }

  private async createSharedFunctions() {
    console.log('⚙️ Creating shared database functions...');

    const shardConfigs = await this.getShardConfigs();

    for (const shard of shardConfigs) {
      const shardPool = new Pool({
        host: shard.host,
        port: shard.port,
        database: shard.database,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      try {
        // Function to generate organization schema name
        await shardPool.query(`
          CREATE OR REPLACE FUNCTION global.generate_schema_name(org_id VARCHAR)
          RETURNS VARCHAR AS $$
          BEGIN
            RETURN 'org_' || REPLACE(org_id, '-', '');
          END;
          $$ LANGUAGE plpgsql;
        `);

        // Function to create organization schema dynamically
        await shardPool.query(`
          CREATE OR REPLACE FUNCTION global.create_organization_schema(org_id VARCHAR)
          RETURNS VOID AS $$
          DECLARE
            schema_name VARCHAR;
          BEGIN
            schema_name := global.generate_schema_name(org_id);

            EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;

            -- Create clients table
            EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.clients (
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
              status VARCHAR DEFAULT ''active'',
              additional_info TEXT,
              contact_phone VARCHAR,
              contact_name VARCHAR,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )';

            -- Add indexes
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_dept ON ' || schema_name || '.clients(department_id)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_pinfl ON ' || schema_name || '.clients(pinfl)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_status ON ' || schema_name || '.clients(status)';
          END;
          $$ LANGUAGE plpgsql;
        `);

        console.log(`✅ Created functions for shard ${shard.id}`);
      } finally {
        await shardPool.end();
      }
    }
  }

  private async saveShardConfig(shards: ShardConfig[]) {
    const fs = require('fs');
    const path = require('path');

    const configPath = path.join(process.cwd(), 'shard-config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      generated: new Date().toISOString(),
      totalShards: shards.length,
      shards: shards
    }, null, 2));

    console.log(`💾 Saved shard configuration to ${configPath}`);
  }

  private async getShardConfigs(): Promise<ShardConfig[]> {
    const fs = require('fs');
    const path = require('path');

    try {
      const configPath = path.join(process.cwd(), 'shard-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.shards;
    } catch {
      // Generate default config if file doesn't exist
      return this.generateDefaultShardConfig();
    }
  }

  private generateDefaultShardConfig(): ShardConfig[] {
    const regions = [
      'us-east', 'us-west', 'eu-west', 'eu-central',
      'ap-south', 'ap-southeast', 'ap-northeast',
      'me-south', 'af-south', 'sa-east'
    ];

    const shards: ShardConfig[] = [];

    for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
      const region = regions[regionIndex];

      for (let shardIndex = 0; shardIndex < 5; shardIndex++) {
        const shardId = `${regionIndex.toString().padStart(2, '0')}-${shardIndex.toString().padStart(4, '0')}`;

        shards.push({
          id: shardId,
          region,
          host: `db-${region}-${shardIndex}.cluster.local`,
          port: 5432,
          database: `shard_${shardId}`
        });
      }
    }

    return shards;
  }
}

// Run initialization
async function main() {
  const initializer = new DistributedDBInitializer();
  await initializer.initialize();
}

if (require.main === module) {
  main().catch(console.error);
}

export { DistributedDBInitializer };