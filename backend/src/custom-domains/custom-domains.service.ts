import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomDomainDto } from './dto/create-custom-domain.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomDomainsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Yangi custom domain qo'shish
   * DNS verification token generatsiya qilinadi
   */
  async create(organizationId: string, dto: CreateCustomDomainDto) {
    // Domain formatini tekshirish
    const domain = dto.domain.toLowerCase().trim();
    if (!this.isValidDomain(domain)) {
      throw new BadRequestException('Noto\'g\'ri domain formati');
    }

    // Domain allaqachon mavjudligini tekshirish
    const existing = await this.prisma.customDomain.findUnique({
      where: { domain },
    });
    if (existing) {
      throw new ConflictException('Bu domain allaqachon ro\'yxatdan o\'tgan');
    }

    // Verification token generatsiya qilish
    const verificationToken = this.generateVerificationToken();

    // Agar bu birinchi domain bo'lsa, primary qilish
    const existingDomains = await this.prisma.customDomain.count({
      where: { organizationId },
    });

    return this.prisma.customDomain.create({
      data: {
        organizationId,
        domain,
        verificationToken,
        isPrimary: existingDomains === 0 || dto.isPrimary,
        status: 'pending',
        sslStatus: 'pending',
      },
    });
  }

  /**
   * Tashkilotning barcha domainlarini olish
   */
  async findAll(organizationId: string) {
    return this.prisma.customDomain.findMany({
      where: { organizationId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Bitta domainni olish
   */
  async findOne(organizationId: string, domainId: string) {
    const domain = await this.prisma.customDomain.findFirst({
      where: { id: domainId, organizationId },
      include: { organization: { select: { name: true, subdomain: true } } },
    });

    if (!domain) {
      throw new NotFoundException('Domain topilmadi');
    }

    return domain;
  }

  /**
   * Domainni o'chirish
   */
  async remove(organizationId: string, domainId: string) {
    const domain = await this.findOne(organizationId, domainId);

    // Agar primary domain o'chirilsa, boshqa domainni primary qilish
    if (domain.isPrimary) {
      const otherDomain = await this.prisma.customDomain.findFirst({
        where: { organizationId, id: { not: domainId }, status: 'active' },
      });

      if (otherDomain) {
        await this.prisma.customDomain.update({
          where: { id: otherDomain.id },
          data: { isPrimary: true },
        });
      }
    }

    return this.prisma.customDomain.delete({
      where: { id: domainId },
    });
  }

  /**
   * Domain verification ma'lumotlarini olish
   * DNS TXT record uchun yo'riqnoma
   */
  async getVerificationInfo(organizationId: string, domainId: string) {
    const domain = await this.findOne(organizationId, domainId);

    return {
      domain: domain.domain,
      status: domain.status,
      verificationToken: domain.verificationToken,
      dnsInstructions: {
        type: 'TXT',
        name: `_edustatus-verification.${domain.domain}`,
        value: `edustatus-site-verification=${domain.verificationToken}`,
        ttl: 3600,
      },
      cnameInstructions: {
        type: 'CNAME',
        name: domain.domain,
        value: 'app.edustatus.uz',
        ttl: 3600,
      },
    };
  }

  /**
   * Domainni tasdiqlash (verify)
   * Bu funksiya real production da DNS so'rovi yuborib tekshirishi kerak
   * Hozircha mock implementation
   */
  async verify(organizationId: string, domainId: string) {
    const domain = await this.findOne(organizationId, domainId);

    if (domain.status === 'active') {
      throw new BadRequestException('Domain allaqachon tasdiqlangan');
    }

    // TODO: Real DNS verification
    // const dnsResult = await this.checkDnsVerification(domain.domain, domain.verificationToken);
    // if (!dnsResult) {
    //   throw new BadRequestException('DNS verification failed');
    // }

    // Mock: DNS verification muvaffaqiyatli deb hisoblaymiz
    const updated = await this.prisma.customDomain.update({
      where: { id: domainId },
      data: {
        status: 'active',
        verifiedAt: new Date(),
        sslStatus: 'provisioning',
      },
    });

    // SSL provisioning ni boshlash (mock)
    setTimeout(() => {
      this.provisionSsl(domainId);
    }, 5000);

    return updated;
  }

  /**
   * SSL sertifikat provision qilish
   * Production da Let's Encrypt yoki Cloudflare API ishlatiladi
   */
  private async provisionSsl(domainId: string) {
    try {
      // TODO: Real SSL provisioning
      // Hozircha mock
      await this.prisma.customDomain.update({
        where: { id: domainId },
        data: {
          sslStatus: 'active',
          sslProvisionedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.customDomain.update({
        where: { id: domainId },
        data: {
          sslStatus: 'failed',
          lastError: error.message,
        },
      });
    }
  }

  /**
   * Primary domainni o'zgartirish
   */
  async setPrimary(organizationId: string, domainId: string) {
    const domain = await this.findOne(organizationId, domainId);

    if (domain.status !== 'active') {
      throw new BadRequestException('Faqat tasdiqlangan domainni primary qilish mumkin');
    }

    // Boshqa domainlarni primary emas qilish
    await this.prisma.customDomain.updateMany({
      where: { organizationId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Bu domainni primary qilish
    return this.prisma.customDomain.update({
      where: { id: domainId },
      data: { isPrimary: true },
    });
  }

  /**
   * Domain orqali tashkilotni topish (tenant resolution)
   */
  async resolveOrganization(domain: string) {
    const customDomain = await this.prisma.customDomain.findFirst({
      where: { domain, status: 'active' },
      include: { organization: true },
    });

    return customDomain?.organization || null;
  }

  /**
   * Barcha active domainlarni olish (admin uchun)
   */
  async findAllActive() {
    return this.prisma.customDomain.findMany({
      where: { status: 'active' },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true },
        },
      },
    });
  }

  // Helper methods

  private isValidDomain(domain: string): boolean {
    // Domain formatini tekshirish
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    return domainRegex.test(domain);
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  // TODO: Real DNS verification
  // private async checkDnsVerification(domain: string, token: string): Promise<boolean> {
  //   // DNS TXT record ni tekshirish
  //   // dns.resolveTxt() ishlatish
  // }
}
