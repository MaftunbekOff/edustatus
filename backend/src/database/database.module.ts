import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShardManager } from './shard-manager';
import { QueryRouter } from './query-router';
import { MigrationOrchestrator } from './migration-orchestrator';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    ShardManager,
    QueryRouter,
    MigrationOrchestrator,
  ],
  exports: [
    ShardManager,
    QueryRouter,
    MigrationOrchestrator,
  ],
})
export class DatabaseModule {}