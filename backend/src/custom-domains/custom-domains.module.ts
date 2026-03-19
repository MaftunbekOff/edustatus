import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomDomainsService } from './custom-domains.service';
import { CustomDomainsController, AdminCustomDomainsController } from './custom-domains.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CustomDomainsController, AdminCustomDomainsController],
  providers: [CustomDomainsService],
  exports: [CustomDomainsService],
})
export class CustomDomainsModule {}
