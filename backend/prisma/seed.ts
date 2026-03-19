import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Bcrypt rounds - 12 for strong security
const BCRYPT_ROUNDS = 12

// Development-only warning password - clearly indicates this should not be used in production
const DEV_WARNING_PASSWORD = 'DevOnly_ChangeMe_InProduction_2024!'

async function main() {
  console.log('Seeding database...')

  // Get passwords from environment variables or throw error in production
  const isProduction = process.env.NODE_ENV === 'production'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD
  const orgAdminPassword = process.env.ORG_ADMIN_PASSWORD

  if (isProduction && (!superAdminPassword || !orgAdminPassword)) {
    throw new Error('SUPER_ADMIN_PASSWORD and ORG_ADMIN_PASSWORD must be set in production')
  }

  // Warn if using development defaults in non-production
  if (!isProduction && !superAdminPassword) {
    console.warn('⚠️  WARNING: Using development default password. Set SUPER_ADMIN_PASSWORD environment variable.')
    console.warn('⚠️  Check DEV_WARNING_PASSWORD constant in seed.ts for the development password.')
  }

  // Create Super Admin
  const hashedSuperAdminPassword = await bcrypt.hash(
    superAdminPassword || DEV_WARNING_PASSWORD,
    BCRYPT_ROUNDS
  )
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'admin@edustatus.uz' },
    update: {},
    create: {
      email: 'admin@edustatus.uz',
      password: hashedSuperAdminPassword,
      fullName: 'Creator',
      role: 'creator',
    },
  })
  console.log('Created creator admin:', superAdmin.email)

  // Create a demo organization
  const organization = await prisma.organization.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Tibbiyot Texnikumi',
      inn: '123456789',
      type: 'education',
      industry: 'education',
      isGovernment: true,
      region: 'toshkent_sh',
      district: 'chilonzor',
      subdomain: 'demo',
      plan: 'pro',
      status: 'active',
      email: 'admin@tibbiyot.uz',
      phone: '+998901234567',
      address: 'Toshkent shahar, Chilonzor tumani',
      clientLimit: 500,
      departmentLimit: 20,
      hasClients: true,
      hasPayments: true,
      hasReports: true,
      hasBankIntegration: true,
      hasTelegramBot: true,
      hasSmsNotifications: true,
      hasExcelImport: true,
      hasPdfReports: true,
    },
  })
  console.log('Created organization:', organization.name)

  // Create organization admin
  const hashedOrgAdminPassword = await bcrypt.hash(
    orgAdminPassword || DEV_WARNING_PASSWORD,
    BCRYPT_ROUNDS
  )
  const organizationAdmin = await prisma.organizationAdmin.upsert({
    where: { email: 'admin@tibbiyot.uz' },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@tibbiyot.uz',
      password: hashedOrgAdminPassword,
      fullName: 'Texnikum Admini',
      role: 'admin',
      status: 'active',
    },
  })
  console.log('Created organization admin:', organizationAdmin.email)

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { organizationId_name: { organizationId: organization.id, name: '101-A' } },
      update: {},
      create: {
        organizationId: organization.id,
        name: '101-A',
        specialty: 'Hamshiralik ishi',
        course: 1,
        year: 2024,
      },
    }),
    prisma.department.upsert({
      where: { organizationId_name: { organizationId: organization.id, name: '102-B' } },
      update: {},
      create: {
        organizationId: organization.id,
        name: '102-B',
        specialty: 'Farmatsiya',
        course: 1,
        year: 2024,
      },
    }),
    prisma.department.upsert({
      where: { organizationId_name: { organizationId: organization.id, name: '201-A' } },
      update: {},
      create: {
        organizationId: organization.id,
        name: '201-A',
        specialty: 'Hamshiralik ishi',
        course: 2,
        year: 2024,
      },
    }),
    prisma.department.upsert({
      where: { organizationId_name: { organizationId: organization.id, name: '202-B' } },
      update: {},
      create: {
        organizationId: organization.id,
        name: '202-B',
        specialty: 'Farmatsiya',
        course: 2,
        year: 2024,
      },
    }),
    prisma.department.upsert({
      where: { organizationId_name: { organizationId: organization.id, name: '301-A' } },
      update: {},
      create: {
        organizationId: organization.id,
        name: '301-A',
        specialty: 'Hamshiralik ishi',
        course: 3,
        year: 2024,
      },
    }),
  ])
  console.log('Created', departments.length, 'departments')

  // Create sample clients
  const clientsData = [
    {
      pinfl: '12345678901234',
      contractNumber: 'SH-2024-001',
      fullName: 'Aliyev Anvar Abdullaevich',
      phone: '+998901111111',
      departmentId: departments[0].id,
      totalAmount: 12000000,
      paidAmount: 6000000,
      debtAmount: 6000000,
    },
    {
      pinfl: '12345678901235',
      contractNumber: 'SH-2024-002',
      fullName: 'Valiyeva Dilnoza Karimovna',
      phone: '+998902222222',
      departmentId: departments[0].id,
      totalAmount: 12000000,
      paidAmount: 12000000,
      debtAmount: 0,
    },
    {
      pinfl: '12345678901236',
      contractNumber: 'SH-2024-003',
      fullName: 'Karimov Bobur Rahimovich',
      phone: '+998903333333',
      departmentId: departments[1].id,
      totalAmount: 10000000,
      paidAmount: 2500000,
      debtAmount: 7500000,
    },
    {
      pinfl: '12345678901237',
      contractNumber: 'SH-2024-004',
      fullName: 'Najimova Nigora Bahodirovna',
      phone: '+998904444444',
      departmentId: departments[1].id,
      totalAmount: 10000000,
      paidAmount: 8000000,
      debtAmount: 2000000,
    },
    {
      pinfl: '12345678901238',
      contractNumber: 'SH-2024-005',
      fullName: 'Rahimov Jahongir Toshmatovich',
      phone: '+998905555555',
      departmentId: departments[2].id,
      totalAmount: 12000000,
      paidAmount: 4000000,
      debtAmount: 8000000,
    },
    {
      pinfl: '12345678901239',
      contractNumber: 'SH-2024-006',
      fullName: 'Sattorova Sevara Alisherovna',
      phone: '+998906666666',
      departmentId: departments[2].id,
      totalAmount: 12000000,
      paidAmount: 12000000,
      debtAmount: 0,
    },
    {
      pinfl: '12345678901240',
      contractNumber: 'SH-2024-007',
      fullName: 'Toshmatov Temur Ulugbekovich',
      phone: '+998907777777',
      departmentId: departments[3].id,
      totalAmount: 10000000,
      paidAmount: 5000000,
      debtAmount: 5000000,
    },
    {
      pinfl: '12345678901241',
      contractNumber: 'SH-2024-008',
      fullName: 'Umarova Umida Bahromovna',
      phone: '+998908888888',
      departmentId: departments[3].id,
      totalAmount: 10000000,
      paidAmount: 10000000,
      debtAmount: 0,
    },
    {
      pinfl: '12345678901242',
      contractNumber: 'SH-2024-009',
      fullName: 'Xolmatov Xurshid Davronovich',
      phone: '+998909999999',
      departmentId: departments[4].id,
      totalAmount: 12000000,
      paidAmount: 3000000,
      debtAmount: 9000000,
    },
    {
      pinfl: '12345678901243',
      contractNumber: 'SH-2024-010',
      fullName: 'Yuldasheva Yulduz Farhodovna',
      phone: '+998900000000',
      departmentId: departments[4].id,
      totalAmount: 12000000,
      paidAmount: 9000000,
      debtAmount: 3000000,
    },
  ]

  for (const clientData of clientsData) {
    await prisma.client.upsert({
      where: { contractNumber: clientData.contractNumber },
      update: {},
      create: {
        organizationId: organization.id,
        ...clientData,
        status: 'active',
      },
    })
  }
  console.log('Created', clientsData.length, 'clients')

  // Create sample payments
  const paymentsData = [
    {
      clientContractNumber: 'SH-2024-001',
      amount: 3000000,
      paymentMethod: 'bank',
      status: 'confirmed',
      paymentDate: new Date('2024-01-15'),
    },
    {
      clientContractNumber: 'SH-2024-001',
      amount: 3000000,
      paymentMethod: 'click',
      status: 'confirmed',
      paymentDate: new Date('2024-02-15'),
    },
    {
      clientContractNumber: 'SH-2024-002',
      amount: 6000000,
      paymentMethod: 'bank',
      status: 'confirmed',
      paymentDate: new Date('2024-01-10'),
    },
    {
      clientContractNumber: 'SH-2024-002',
      amount: 6000000,
      paymentMethod: 'payme',
      status: 'confirmed',
      paymentDate: new Date('2024-02-10'),
    },
    {
      clientContractNumber: 'SH-2024-003',
      amount: 2500000,
      paymentMethod: 'cash',
      status: 'confirmed',
      paymentDate: new Date('2024-01-20'),
    },
    {
      clientContractNumber: 'SH-2024-004',
      amount: 4000000,
      paymentMethod: 'bank',
      status: 'pending',
      paymentDate: new Date('2024-02-20'),
    },
    {
      clientContractNumber: 'SH-2024-005',
      amount: 2000000,
      paymentMethod: 'click',
      status: 'confirmed',
      paymentDate: new Date('2024-01-25'),
    },
    {
      clientContractNumber: 'SH-2024-005',
      amount: 2000000,
      paymentMethod: 'bank',
      status: 'pending',
      paymentDate: new Date('2024-02-25'),
    },
  ]

  for (const paymentData of paymentsData) {
    const client = await prisma.client.findUnique({
      where: { contractNumber: paymentData.clientContractNumber },
    })
    if (client) {
      await prisma.payment.create({
        data: {
          organizationId: organization.id,
          clientId: client.id,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          status: paymentData.status,
          paymentDate: paymentData.paymentDate,
        },
      })
    }
  }
  console.log('Created sample payments')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
