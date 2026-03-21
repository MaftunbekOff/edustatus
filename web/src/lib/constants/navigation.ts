/**
 * Navigation configuration based on organization type/category
 * This file defines which menu items appear for different organization types
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LucideIcon = new (...args: any[]) => any

import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Bell,
  QrCode,
  FileSignature,
  GraduationCap,
  UserCog,
  Calculator,
  Stethoscope,
  HeartPulse,
  Pill,
  ShoppingCart,
  Package,
  Factory,
  Building2,
  Code,
  Briefcase,
  Scissors,
  UtensilsCrossed,
  BedDouble,
  Car,
  Dumbbell,
  BookOpen,
  Baby,
  Calendar,
  Clock,
  Wallet,
  Receipt,
  TrendingUp,
  Warehouse,
  Truck,
  Users2,
  ClipboardList,
  Wrench,
  SprayCan,
} from 'lucide-svelte'

// ==========================================
// NAVIGATION ITEM INTERFACE
// ==========================================

export interface NavItem {
  name: string
  href: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  children?: NavItem[]
  badge?: string
}

// ==========================================
// BASE NAVIGATION ITEMS
// ==========================================

const dashboardItem: NavItem = {
  name: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
}

const paymentsItem: NavItem = {
  name: "To'lovlar",
  href: "/dashboard/payments",
  icon: CreditCard,
}

const bankItem: NavItem = {
  name: "Bank reestr",
  href: "/dashboard/bank",
  icon: FileText,
}

const contractsItem: NavItem = {
  name: "Shartnomalar",
  href: "/dashboard/contracts",
  icon: FileSignature,
}

const remindersItem: NavItem = {
  name: "Eslatmalar",
  href: "/dashboard/reminders",
  icon: Bell,
}

const attendanceItem: NavItem = {
  name: "Davomat",
  href: "/dashboard/attendance",
  icon: QrCode,
}

const reportsItem: NavItem = {
  name: "Hisobotlar",
  href: "/dashboard/reports",
  icon: FileText,
}

const hrItem: NavItem = {
  name: "Kadrlar",
  href: "/dashboard/hr",
  icon: UserCog,
  children: [
    { name: "Xodimlar ro'yxati", href: "/dashboard/hr", icon: Users },
    { name: "Ishga qabul qilish", href: "/dashboard/hr/hiring", icon: Users },
    { name: "Davomat", href: "/dashboard/hr/attendance", icon: Clock },
    { name: "Ta'tillar", href: "/dashboard/hr/vacations", icon: Calendar },
  ],
}

const accountingItem: NavItem = {
  name: "Buxgalteriya",
  href: "/dashboard/accounting",
  icon: Calculator,
  children: [
    { name: "Bosh sahifa", href: "/dashboard/accounting", icon: LayoutDashboard },
    { name: "Xarajatlar", href: "/dashboard/accounting/expenses", icon: Receipt },
    { name: "Soliqlar", href: "/dashboard/accounting/taxes", icon: Calculator },
  ],
}

const settingsItem: NavItem = {
  name: "Sozlamalar",
  href: "/dashboard/settings",
  icon: Settings,
}

// ==========================================
// EDUCATION NAVIGATION
// ==========================================

const educationNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Talabalar",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    name: "O'qituvchilar",
    href: "/dashboard/teachers",
    icon: GraduationCap,
  },
  paymentsItem,
  {
    name: "Dublikatlar",
    href: "/dashboard/duplicates",
    icon: Shield,
  },
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// MEDICAL NAVIGATION
// ==========================================

const medicalNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Bemorlar",
    href: "/dashboard/patients",
    icon: HeartPulse,
  },
  {
    name: "Shifokorlar",
    href: "/dashboard/doctors",
    icon: Stethoscope,
  },
  {
    name: "Bo'limlar",
    href: "/dashboard/departments",
    icon: Building2,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// SERVICE NAVIGATION
// ==========================================

const serviceNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Mijozlar",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Xodimlar",
    href: "/dashboard/staff",
    icon: Users2,
  },
  {
    name: "Xizmatlar",
    href: "/dashboard/services",
    icon: Briefcase,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// RETAIL NAVIGATION
// ==========================================

const retailNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Mijozlar",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Mahsulotlar",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Ombor",
    href: "/dashboard/warehouse",
    icon: Warehouse,
  },
  {
    name: "Savdo",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// MANUFACTURING NAVIGATION
// ==========================================

const manufacturingNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Buyurtmachilar",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Ishchilar",
    href: "/dashboard/workers",
    icon: Users2,
  },
  {
    name: "Ishlab chiqarish",
    href: "/dashboard/production",
    icon: Factory,
  },
  {
    name: "Ombor",
    href: "/dashboard/warehouse",
    icon: Warehouse,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// FINANCE NAVIGATION
// ==========================================

const financeNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Mijozlar",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Xizmatlar",
    href: "/dashboard/services",
    icon: Briefcase,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// IT NAVIGATION
// ==========================================

const itNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Mijozlar",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Jamoa",
    href: "/dashboard/team",
    icon: Users2,
  },
  {
    name: "Loyihalar",
    href: "/dashboard/projects",
    icon: Code,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// OTHER NAVIGATION (DEFAULT)
// ==========================================

const otherNavigation: NavItem[] = [
  dashboardItem,
  {
    name: "Mijozlar",
    href: "/dashboard/clients",
    icon: Users,
  },
  paymentsItem,
  bankItem,
  contractsItem,
  remindersItem,
  attendanceItem,
  reportsItem,
  hrItem,
  accountingItem,
  settingsItem,
]

// ==========================================
// NAVIGATION BY CATEGORY
// ==========================================

export const navigationByCategory: Record<string, NavItem[]> = {
  education: educationNavigation,
  medical: medicalNavigation,
  service: serviceNavigation,
  retail: retailNavigation,
  manufacturing: manufacturingNavigation,
  finance: financeNavigation,
  it: itNavigation,
  other: otherNavigation,
}

// ==========================================
// ORGANIZATION TYPE TO CATEGORY MAPPING
// ==========================================

export const organizationTypeToCategory: Record<string, string> = {
  // Education
  school: "education",
  college: "education",
  lyceum: "education",
  university: "education",
  training_center: "education",
  kindergarten: "education",
  driving_school: "education",
  sports_school: "education",
  
  // Medical
  clinic: "medical",
  hospital: "medical",
  pharmacy: "medical",
  dental: "medical",
  diagnostic_center: "medical",
  
  // Service
  beauty_salon: "service",
  barber_shop: "service",
  fitness_center: "service",
  restaurant: "service",
  cafe: "service",
  hotel: "service",
  laundry: "service",
  repair_service: "service",
  
  // Retail
  shop: "retail",
  supermarket: "retail",
  wholesale: "retail",
  online_store: "retail",
  
  // Manufacturing
  factory: "manufacturing",
  workshop: "manufacturing",
  bakery: "manufacturing",
  
  // Finance
  bank: "finance",
  insurance: "finance",
  accounting: "finance",
  
  // IT
  it_company: "it",
  software_development: "it",
  web_studio: "it",
  
  // Other
  other: "other",
}

// ==========================================
// DEPARTMENT LABELS BY CATEGORY
// ==========================================

export const departmentLabelsByCategory: Record<string, { singular: string; plural: string }> = {
  education: { singular: "Guruh", plural: "Guruhlar" },
  medical: { singular: "Bo'lim", plural: "Bo'limlar" },
  service: { singular: "Bo'lim", plural: "Bo'limlar" },
  retail: { singular: "Filial", plural: "Filiallar" },
  manufacturing: { singular: "Sex", plural: "Sexlar" },
  finance: { singular: "Bo'lim", plural: "Bo'limlar" },
  it: { singular: "Jamoa", plural: "Jamoalar" },
  other: { singular: "Bo'lim", plural: "Bo'limlar" },
}

// ==========================================
// CLIENT/PERSON LABELS BY CATEGORY
// ==========================================

export const clientLabelsByCategory: Record<string, { singular: string; plural: string }> = {
  education: { singular: "Talaba", plural: "Talabalar" },
  medical: { singular: "Bemor", plural: "Bemorlar" },
  service: { singular: "Mijoz", plural: "Mijozlar" },
  retail: { singular: "Mijoz", plural: "Mijozlar" },
  manufacturing: { singular: "Buyurtmachi", plural: "Buyurtmachilar" },
  finance: { singular: "Mijoz", plural: "Mijozlar" },
  it: { singular: "Mijoz", plural: "Mijozlar" },
  other: { singular: "Mijoz", plural: "Mijozlar" },
}

// ==========================================
// STAFF LABELS BY CATEGORY
// ==========================================

export const staffLabelsByCategory: Record<string, { singular: string; plural: string }> = {
  education: { singular: "O'qituvchi", plural: "O'qituvchilar" },
  medical: { singular: "Shifokor", plural: "Shifokorlar" },
  service: { singular: "Xodim", plural: "Xodimlar" },
  retail: { singular: "Xodim", plural: "Xodimlar" },
  manufacturing: { singular: "Ishchi", plural: "Ishchilar" },
  finance: { singular: "Xodim", plural: "Xodimlar" },
  it: { singular: "Dasturchi", plural: "Dasturchilar" },
  other: { singular: "Xodim", plural: "Xodimlar" },
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get navigation for an organization type
 */
export function getNavigationForOrganizationType(organizationType: string): NavItem[] {
  const category = organizationTypeToCategory[organizationType] || "other"
  return navigationByCategory[category] || otherNavigation
}

/**
 * Get navigation for an organization category
 */
export function getNavigationForCategory(category: string): NavItem[] {
  return navigationByCategory[category] || otherNavigation
}

/**
 * Get department labels for an organization type
 */
export function getDepartmentLabels(organizationType: string): { singular: string; plural: string } {
  const category = organizationTypeToCategory[organizationType] || "other"
  return departmentLabelsByCategory[category] || departmentLabelsByCategory.other
}

/**
 * Get client labels for an organization type
 */
export function getClientLabels(organizationType: string): { singular: string; plural: string } {
  const category = organizationTypeToCategory[organizationType] || "other"
  return clientLabelsByCategory[category] || clientLabelsByCategory.other
}

/**
 * Get staff labels for an organization type
 */
export function getStaffLabels(organizationType: string): { singular: string; plural: string } {
  const category = organizationTypeToCategory[organizationType] || "other"
  return staffLabelsByCategory[category] || staffLabelsByCategory.other
}

/**
 * Get category from organization type
 */
export function getCategoryFromOrganizationType(organizationType: string): string {
  return organizationTypeToCategory[organizationType] || "other"
}
