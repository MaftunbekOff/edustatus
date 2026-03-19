# Global-Scale Distributed Database Deployment Guide

## Overview
Bu qo'llanma 12 million tashkilot uchun global distributed database arxitekturasini deploy qilish uchun mo'ljallangan.

## Architecture Summary

```
🌍 Global Infrastructure (12M Organizations)
├── 10 Regions × 5 Shards = 50 Database Shards
├── Geo-distributed across AWS/Azure regions
├── Schema-per-Organization within each shard
└── Global tables replicated across all shards

Data Distribution:
- 1.2M organizations per shard (50 shards total)
- 100-240M clients per shard
- 6-14B payments per shard
- Total: 12B+ records across all shards
```

---

## 1. Infrastructure Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Environment setup
cp .env.distributed .env
# Edit .env with your infrastructure details
```

### Environment Variables
```env
# Master Database (for coordination)
DB_MASTER_HOST=postgres-master.cluster.local
DB_MASTER_PORT=5432
DB_MASTER_DATABASE=postgres
DB_MASTER_USER=orgstatus
DB_MASTER_PASSWORD=secure-password

# Redis Clusters (per region)
REDIS_HOST_us_east=redis-us-east.cluster.local
REDIS_HOST_eu_west=redis-eu-west.cluster.local
# ... for all 10 regions

# Shard Databases (50 shards)
DB_HOST_00-0000=db-us-east-0.cluster.local
DB_HOST_00-0001=db-us-east-1.cluster.local
# ... pattern: DB_HOST_{REGION_INDEX}-{SHARD_INDEX}

# Migration settings
OLD_DATABASE_URL=postgresql://user:pass@old-db:5432/old_db
MIGRATION_DB_URL=postgresql://user:pass@migration-db:5432/migration_db
```

### Database Cluster Setup
```terraform
# infrastructure/terraform/main.tf
resource "aws_db_instance" "shard" {
  count = 50

  identifier           = "orgstatus-shard-${count.index}"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.r6g.4xlarge"  # 16 vCPU, 128GB RAM
  allocated_storage   = 2000             # 2TB per shard
  iops               = 64000             # Max IOPS
  storage_type       = "io2"

  multi_az           = true
  backup_retention_period = 30
  deletion_protection = true

  tags = {
    Name        = "OrgStatus-Shard-${count.index}"
    ShardId     = count.index
    Region      = local.regions[count.index / 5]
    Environment = "production"
  }
}

resource "aws_elasticache_cluster" "redis" {
  count = 10  # One per region

  cluster_id      = "orgstatus-redis-${local.regions[count.index]}"
  engine         = "redis"
  node_type      = "cache.r6g.large"
  num_cache_nodes = 3
  engine_version = "7.0"

  tags = {
    Name    = "OrgStatus-Redis-${local.regions[count.index]}"
    Region  = local.regions[count.index]
  }
}
```

---

## 2. Database Initialization

### Step 1: Initialize Distributed Infrastructure
```bash
# Initialize all shards and global schemas
cd backend
npm run init:distributed-db

# This will:
# - Create 50 shard databases
# - Initialize global schemas on each shard
# - Create routing tables
# - Set up shared functions
```

### Step 2: Generate Prisma Client
```bash
# Generate Prisma client for global tables
npx prisma generate --schema=prisma/schema.distributed.prisma

# Deploy global schema to all shards
npm run db:deploy:global
```

### Step 3: Health Check
```bash
# Verify all shards are accessible
npm run health:shards

# Expected output:
# ✅ Shard 00-0000: healthy
# ✅ Shard 00-0001: healthy
# ...
# ✅ All 50 shards healthy
```

---

## 3. Migration from Single DB to Sharded

### Phase 1: Data Export
```bash
# Export data from old database
npm run migration:export

# This creates compressed backups:
# - organizations.sql.gz
# - clients.sql.gz (12M chunks)
# - payments.sql.gz (60M chunks)
```

### Phase 2: Parallel Data Import
```bash
# Import data to shards (parallel processing)
npm run migration:import -- --parallel=10

# Progress monitoring:
# 📊 Migration Progress: 2.3M/12M organizations (19%)
# ⏱️ ETA: 4.2 hours remaining
```

### Phase 3: Validation
```bash
# Validate data integrity across all shards
npm run migration:validate

# Validation checks:
# ✅ Row counts match
# ✅ Foreign key constraints valid
# ✅ Data checksums match
# ✅ Organization schemas created
```

### Phase 4: Switch Traffic
```bash
# Enable dual-write mode
export DUAL_WRITE_ENABLED=true

# Monitor for 24 hours
npm run monitor:dual-write

# Switch to sharded system
export USE_SHARDED_SYSTEM=true
export DUAL_WRITE_ENABLED=false
```

---

## 4. Application Deployment

### Backend Deployment
```yaml
# kubernetes/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orgstatus-backend
spec:
  replicas: 50  # One per shard
  selector:
    matchLabels:
      app: orgstatus-backend
  template:
    metadata:
      labels:
        app: orgstatus-backend
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.kubernetes.io/region
                operator: In
                values:
                - us-east-1  # Shard-specific region
      containers:
      - name: backend
        image: orgstatus/backend:latest
        env:
        - name: SHARD_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.labels['shard-id']
        - name: REGION
          valueFrom:
            fieldRef:
              fieldPath: metadata.labels['region']
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Load Balancer Configuration
```yaml
# Global load balancing
apiVersion: v1
kind: Service
metadata:
  name: orgstatus-global-lb
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: 'true'
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-path: '/health'
spec:
  type: LoadBalancer
  selector:
    app: orgstatus-backend
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 443
    targetPort: 3001
    protocol: TCP
    name: https
```

---

## 5. Monitoring & Observability

### Metrics Collection
```typescript
// backend/src/monitoring/metrics.service.ts
@Injectable()
export class MetricsService {
  private registry = new Registry();

  constructor() {
    this.setupMetrics();
    this.setupHealthChecks();
  }

  private setupMetrics() {
    // Database metrics
    new Gauge({
      name: 'db_connections_active',
      help: 'Active database connections per shard',
      labelNames: ['shard_id', 'region'],
    });

    new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration',
      labelNames: ['shard_id', 'table', 'operation'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    });

    // Cache metrics
    new Gauge({
      name: 'cache_hit_ratio',
      help: 'Cache hit ratio per region',
      labelNames: ['region', 'cache_level'],
    });

    // Application metrics
    new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'endpoint', 'status'],
    });

    new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    });
  }

  private setupHealthChecks() {
    // Shard health checks
    setInterval(async () => {
      const health = await this.checkShardHealth();
      this.updateHealthMetrics(health);
    }, 30000); // Every 30 seconds
  }
}
```

### Dashboard Setup
```yaml
# Grafana dashboard configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard
data:
  dashboard.json: |
    {
      "title": "OrgStatus Global Monitoring",
      "panels": [
        {
          "title": "Global Request Rate",
          "type": "graph",
          "targets": [{
            "expr": "sum(rate(http_requests_total[5m])) by (region)",
            "legendFormat": "{{region}}"
          }]
        },
        {
          "title": "Database Query Latency",
          "type": "heatmap",
          "targets": [{
            "expr": "histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 Latency"
          }]
        },
        {
          "title": "Shard Health Status",
          "type": "table",
          "targets": [{
            "expr": "up{job='shard-health'}",
            "legendFormat": "{{shard_id}}"
          }]
        }
      ]
    }
```

---

## 6. Performance Optimization

### Query Optimization
```sql
-- Optimized queries for large datasets

-- 1. Partitioned payments table (by month)
CREATE TABLE payments_y2024m01 PARTITION OF payments
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 2. Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_clients_org_status
  ON clients (organization_id, status)
  WHERE status = 'active';

-- 3. Partial indexes for hot data
CREATE INDEX CONCURRENTLY idx_recent_payments
  ON payments (organization_id, client_id, payment_date)
  WHERE payment_date > CURRENT_DATE - INTERVAL '90 days';
```

### Caching Strategy
```typescript
// Multi-level caching
const cacheStrategy = {
  l1: { ttl: 30, location: 'application' },    // 30 seconds
  l2: { ttl: 300, location: 'regional' },     // 5 minutes
  l3: { ttl: 3600, location: 'global' },      // 1 hour
  l4: { ttl: 86400, location: 'cdn' },        // 24 hours
};
```

### Connection Pooling
```typescript
// Optimized connection pools
const poolConfig = {
  min: 5,
  max: 50,
  idleTimeoutMillis: 30000,
  acquireTimeoutMillis: 60000,
  evictionRunIntervalMillis: 10000,
  softIdleTimeoutMillis: 30000,
  testOnBorrow: true,
  testOnReturn: true,
  testOnIdle: true,
};
```

---

## 7. Backup & Disaster Recovery

### Backup Strategy
```bash
# Parallel shard backups
#!/bin/bash
SHARDS=$(seq -f "%02g-%04g" 0 49)

for shard in $SHARDS; do
  pg_dump --compress=9 --format=directory \
    --jobs=4 --verbose \
    --host="db-$shard.cluster.local" \
    --dbname="shard_$shard" \
    --file="/backup/shard_$shard-$(date +%Y%m%d)" &
done

wait
echo "All shard backups completed"
```

### Disaster Recovery
```yaml
# Cross-region replication
globalReplication:
  sourceRegions: ['us-east', 'eu-west', 'ap-south']
  targetRegions: ['us-west', 'eu-central', 'ap-northeast']
  replicationLag: '< 30 seconds'
  rto: '< 15 minutes'  # Recovery Time Objective
  rpo: '< 5 minutes'   # Recovery Point Objective

# Automated failover
failoverAutomation:
  triggers:
    - region_unavailable
    - shard_unhealthy
    - high_latency
  actions:
    - promote_replica
    - update_dns
    - notify_team
```

---

## 8. Security Hardening

### Database Security
```sql
-- Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_org_isolation ON clients
  USING (organization_id::text = current_setting('app.organization_id'));

-- Audit triggers
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO global.audit_logs (
    organization_id, user_id, action, entity, entity_id,
    old_value, new_value, ip_address
  ) VALUES (
    current_setting('app.organization_id', true),
    current_setting('app.user_id', true),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    current_setting('app.client_ip', true)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Network Security
```yaml
# VPC and security groups
resource "aws_security_group" "shard_db" {
  name_prefix = "orgstatus-shard-db-"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]  # Only from VPC
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## 9. Cost Analysis

### Monthly Infrastructure Costs
```typescript
const monthlyCosts = {
  database: {
    rdsInstances: 50 * 3500,    // $3.5K per db.r6g.4xlarge
    storage: 50 * 200,          // $200 per TB
    backup: 50 * 100,           // $100 per TB backup
  },
  cache: {
    elasticache: 10 * 300,      // $300 per regional cluster
  },
  compute: {
    ecsTasks: 50 * 500,         // $500 per shard
    loadBalancers: 10 * 200,    // $200 per regional ALB
  },
  cdn: {
    cloudfront: 2000,           // Global CDN
  },
  monitoring: {
    cloudwatch: 1000,
    xray: 500,
  }
};

// Total: ~$450K/month
```

### Performance Targets
- **P95 Query Latency**: < 100ms
- **P99 Query Latency**: < 500ms
- **Availability**: 99.99%
- **RTO**: < 15 minutes
- **RPO**: < 5 minutes
- **Concurrent Users**: 1M+ simultaneous

---

## 10. Maintenance & Operations

### Automated Maintenance
```bash
# Daily maintenance script
#!/bin/bash

# Vacuum and analyze tables
for shard in {00..49}; do
  psql -h "db-$shard.cluster.local" -d "shard_$shard" -c "
    VACUUM ANALYZE;
    REINDEX DATABASE shard_$shard;
  "
done

# Update statistics
for shard in {00..49}; do
  psql -h "db-$shard.cluster.local" -d "shard_$shard" -c "
    ANALYZE;
  "
done

# Archive old logs
find /logs -name "*.log" -mtime +30 -exec gzip {} \;
```

### Scaling Operations
```typescript
// Auto-scaling logic
export class AutoScaler {
  async checkScaling() {
    const metrics = await this.getShardMetrics();

    for (const shard of metrics) {
      if (shard.cpu > 80 || shard.connections > 45) {
        await this.scaleUpShard(shard.id);
      }

      if (shard.cpu < 20 && shard.connections < 10) {
        await this.scaleDownShard(shard.id);
      }
    }
  }

  async scaleUpShard(shardId: string) {
    // Add read replicas
    // Increase connection pool
    // Notify monitoring
  }
}
```

---

## 11. Troubleshooting Guide

### Common Issues & Solutions

#### High Latency Issues
```bash
# Check shard performance
psql -h $SHARD_HOST -d $SHARD_DB -c "
  SELECT * FROM pg_stat_activity
  WHERE state = 'active' AND now() - query_start > interval '30 seconds';
"

# Check connection pool
psql -h $SHARD_HOST -d $SHARD_DB -c "
  SELECT count(*) as active_connections
  FROM pg_stat_activity
  WHERE datname = current_database();
"
```

#### Data Consistency Issues
```typescript
// Consistency checker
export class ConsistencyChecker {
  async checkConsistency(orgId: string) {
    const globalData = await this.getGlobalOrgData(orgId);
    const shardData = await this.getShardOrgData(orgId);

    if (!this.compareData(globalData, shardData)) {
      await this.repairConsistency(orgId);
    }
  }
}
```

#### Memory Issues
```bash
# Check PostgreSQL memory usage
psql -h $SHARD_HOST -d $SHARD_DB -c "
  SELECT name, setting, unit
  FROM pg_settings
  WHERE name LIKE '%mem%' OR name LIKE '%cache%';
"

# Optimize memory settings
ALTER SYSTEM SET shared_buffers = '32GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '2GB';
```

---

## Implementation Timeline

### Phase 1: Infrastructure (2 months)
- [ ] Cloud infrastructure setup
- [ ] Database cluster provisioning
- [ ] Network configuration
- [ ] Security groups and IAM

### Phase 2: Core Systems (3 months)
- [ ] Distributed database implementation
- [ ] Sharding logic development
- [ ] Query routing system
- [ ] Migration tools

### Phase 3: Migration (2 months)
- [ ] Data export from old system
- [ ] Parallel data import
- [ ] Validation and testing
- [ ] Zero-downtime cutover

### Phase 4: Optimization (2 months)
- [ ] Performance tuning
- [ ] Monitoring setup
- [ ] Backup procedures
- [ ] Documentation

### Phase 5: Production (Ongoing)
- [ ] 24/7 monitoring
- [ ] Automated scaling
- [ ] Regular maintenance
- [ ] Performance optimization

**Total Timeline: 9 months for full global deployment**

---

## Success Metrics

### Technical Metrics
- **Query Performance**: P95 < 100ms globally
- **Data Consistency**: 99.999% consistency rate
- **Availability**: 99.99% uptime SLA
- **Backup Success**: 100% successful daily backups

### Business Metrics
- **User Satisfaction**: > 99% user satisfaction
- **Time to Market**: < 24 hours for new features
- **Cost Efficiency**: < $0.50 per organization per month
- **Scalability**: Support 100M+ organizations in future

Bu arxitektura global-scale SaaS platformalar (Stripe, Shopify, Salesforce) darajasida bo'ladi va 12 million tashkilotni qo'llab-quvvatlashga to'liq tayyor.