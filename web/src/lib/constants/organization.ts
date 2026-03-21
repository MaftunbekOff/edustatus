// ==========================================
// ORGANIZATION TYPES (TASHKILOT TURLARI)
// ==========================================

/**
 * Organization type categories
 */
export type OrganizationCategory = "education" | "medical" | "service" | "retail" | "manufacturing" | "finance" | "it" | "other"

/**
 * Organization types by category
 */
export const organizationTypes = [
  // Ta'lim (Education)
  { value: "school", label: "Maktab", category: "education" },
  { value: "college", label: "Kollej", category: "education" },
  { value: "lyceum", label: "Litsey", category: "education" },
  { value: "university", label: "Universitet", category: "education" },
  { value: "training_center", label: "O'quv markazi", category: "education" },
  { value: "kindergarten", label: "Bog'cha", category: "education" },
  { value: "driving_school", label: "Avtomaktab", category: "education" },
  { value: "sports_school", label: "Sport maktabi", category: "education" },
  
  // Tibbiyot (Medical)
  { value: "clinic", label: "Klinika", category: "medical" },
  { value: "hospital", label: "Kasalxona", category: "medical" },
  { value: "pharmacy", label: "Dorixona", category: "medical" },
  { value: "dental", label: "Tish shifokorligi", category: "medical" },
  { value: "diagnostic_center", label: "Diagnostika markazi", category: "medical" },
  
  // Xizmat ko'rsatish (Service)
  { value: "beauty_salon", label: "Go'zallik saloni", category: "service" },
  { value: "barber_shop", label: "Sartaroshxona", category: "service" },
  { value: "fitness_center", label: "Fitnes markazi", category: "service" },
  { value: "restaurant", label: "Restoran", category: "service" },
  { value: "cafe", label: "Kafe", category: "service" },
  { value: "hotel", label: "Mehmonxona", category: "service" },
  { value: "laundry", label: "Kir yuvish", category: "service" },
  { value: "repair_service", label: "Ta'mirlash xizmati", category: "service" },
  
  // Savdo (Retail)
  { value: "shop", label: "Do'kon", category: "retail" },
  { value: "supermarket", label: "Supermarket", category: "retail" },
  { value: "wholesale", label: "Ulgurji savdo", category: "retail" },
  { value: "online_store", label: "Onlayn do'kon", category: "retail" },
  
  // Ishlab chiqarish (Manufacturing)
  { value: "factory", label: "Zavod", category: "manufacturing" },
  { value: "workshop", label: "Ustaxona", category: "manufacturing" },
  { value: "bakery", label: "Nonvoyxona", category: "manufacturing" },
  
  // Moliya (Finance)
  { value: "bank", label: "Bank", category: "finance" },
  { value: "insurance", label: "Sug'urta", category: "finance" },
  { value: "accounting", label: "Buxgalteriya", category: "finance" },
  
  // IT
  { value: "it_company", label: "IT kompaniya", category: "it" },
  { value: "software_development", label: "Dasturiy ta'minot", category: "it" },
  { value: "web_studio", label: "Veb-studiya", category: "it" },
  
  // Boshqa
  { value: "other", label: "Boshqa", category: "other" },
]

/**
 * Organization categories (sohalar)
 */
export const organizationCategories = [
  { value: "education", label: "Ta'lim" },
  { value: "medical", label: "Tibbiyot" },
  { value: "service", label: "Xizmat ko'rsatish" },
  { value: "retail", label: "Savdo" },
  { value: "manufacturing", label: "Ishlab chiqarish" },
  { value: "finance", label: "Moliya" },
  { value: "it", label: "Axborot texnologiyalari" },
  { value: "other", label: "Boshqa" },
]

/**
 * Get organization type by value
 */
export const getOrganizationTypeByValue = (value: string) => {
  return organizationTypes.find(t => t.value === value)
}

/**
 * Get organization types by category
 */
export const getOrganizationTypesByCategory = (category: string) => {
  return organizationTypes.filter(t => t.category === category)
}

// ==========================================
// PLAN TYPES AND FEATURES
// ==========================================

/**
 * Tarif rejalar
 */
export const planFeatures: Record<string, string[]> = {
  basic: ["Mijozlar boshqaruvi", "To'lovlar kuzatish", "Oddiy hisobotlar", "5 bo'lim"],
  pro: ["Basic +", "Bank integratsiyasi", "Excel import/export", "Telegram bot", "20 bo'lim"],
  enterprise: ["Pro +", "SMS bildirishnomalar", "PDF hisobotlar", "Cheksiz bo'lim", "API access", "Priority support"],
}

/**
 * Tarif nomlari
 */
export const planNames: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
}

// ==========================================
// FEATURES
// ==========================================

/**
 * Funksiyalar ro'yxati
 */
export const featureLabels: Record<string, string> = {
  hasClients: "Mijozlar boshqaruvi",
  hasPayments: "To'lovlar kuzatish",
  hasReports: "Hisobotlar",
  hasBankIntegration: "Bank integratsiyasi",
  hasTelegramBot: "Telegram bot",
  hasSmsNotifications: "SMS bildirishnomalar",
  hasExcelImport: "Excel import",
  hasPdfReports: "PDF hisobotlar",
  allowSubOrganizations: "Quyi tashkilotlar",
}

// ==========================================
// STATUS
// ==========================================

/**
 * Status label va ranglari
 */
export const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  trial: { label: "Sinov", variant: "warning" },
  suspended: { label: "To'xtatilgan", variant: "error" },
  pending: { label: "Kutilmoqda", variant: "secondary" },
}

// ==========================================
// ADMIN ROLES
// ==========================================

/**
 * Admin rollari
 */
export const adminRoles: Record<string, string> = {
  admin: "Bosh administrator",
  accountant: "Buxgalter",
  manager: "Menejer",
  operator: "Operator",
}

/**
 * Admin statuslari
 */
export const adminStatusConfig: Record<string, { label: string; variant: "success" | "error" }> = {
  active: { label: "Faol", variant: "success" },
  suspended: { label: "Blok", variant: "error" },
}

// ==========================================
// CLIENT STATUS
// ==========================================

/**
 * Client status types
 */
export const clientStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  inactive: { label: "Nofaol", variant: "warning" },
  archived: { label: "Arxiv", variant: "secondary" },
}

// ==========================================
// DEPARTMENT TYPES
// ==========================================

/**
 * Department types for different organization categories
 */
export const departmentTypesByCategory: Record<string, string[]> = {
  education: ["Guruh", "Sinflar", "Bo'lim", "Kafedra", "Fakultet"],
  medical: ["Bo'lim", "Xona", "Kabineti", "Laboratoriya"],
  service: ["Bo'lim", "Xizmat turi", "Filial"],
  retail: ["Bo'lim", "Filial", "Ombor"],
  manufacturing: ["Sex", "Bo'lim", "Ombor", "Laboratoriya"],
  finance: ["Bo'lim", "Filial", "Xizmat turi"],
  it: ["Jamoa", "Bo'lim", "Loyiha"],
  other: ["Bo'lim", "Filial"],
}

/**
 * Department types for specific organization types
 * More granular control over department naming
 */
export const departmentTypesByOrganizationType: Record<string, { types: string[]; defaultType: string }> = {
  // Education
  school: { types: ["Sinf", "Bo'lim"], defaultType: "Sinf" },
  college: { types: ["Guruh", "Bo'lim", "Kafedra"], defaultType: "Guruh" },
  lyceum: { types: ["Guruh", "Bo'lim"], defaultType: "Guruh" },
  university: { types: ["Fakultet", "Kafedra", "Guruh"], defaultType: "Fakultet" },
  training_center: { types: ["Guruh", "Kurs", "Bo'lim"], defaultType: "Guruh" },
  kindergarten: { types: ["Guruh", "Bo'lim"], defaultType: "Guruh" },
  driving_school: { types: ["Guruh", "Bo'lim"], defaultType: "Guruh" },
  sports_school: { types: ["Guruh", "Bo'lim", "Sport turi"], defaultType: "Guruh" },
  
  // Medical
  clinic: { types: ["Bo'lim", "Xona", "Kabineti"], defaultType: "Bo'lim" },
  hospital: { types: ["Bo'lim", "Xona", "Palata"], defaultType: "Bo'lim" },
  pharmacy: { types: ["Bo'lim", "Filial"], defaultType: "Bo'lim" },
  dental: { types: ["Kabineti", "Bo'lim"], defaultType: "Kabineti" },
  diagnostic_center: { types: ["Bo'lim", "Xona", "Laboratoriya"], defaultType: "Bo'lim" },
  
  // Service
  beauty_salon: { types: ["Bo'lim", "Xizmat turi"], defaultType: "Bo'lim" },
  barber_shop: { types: ["Bo'lim", "Xizmat turi"], defaultType: "Bo'lim" },
  fitness_center: { types: ["Bo'lim", "Xizmat turi", "Guruh"], defaultType: "Bo'lim" },
  restaurant: { types: ["Bo'lim", "Zal", "Filial"], defaultType: "Bo'lim" },
  cafe: { types: ["Bo'lim", "Zal", "Filial"], defaultType: "Bo'lim" },
  hotel: { types: ["Bo'lim", "Xona", "Qavat"], defaultType: "Bo'lim" },
  laundry: { types: ["Bo'lim", "Xizmat turi"], defaultType: "Bo'lim" },
  repair_service: { types: ["Bo'lim", "Xizmat turi"], defaultType: "Bo'lim" },
  
  // Retail
  shop: { types: ["Bo'lim", "Filial"], defaultType: "Bo'lim" },
  supermarket: { types: ["Bo'lim", "Filial", "Ombor"], defaultType: "Bo'lim" },
  wholesale: { types: ["Bo'lim", "Ombor", "Filial"], defaultType: "Bo'lim" },
  online_store: { types: ["Bo'lim", "Ombor"], defaultType: "Bo'lim" },
  
  // Manufacturing
  factory: { types: ["Sex", "Bo'lim", "Ombor", "Laboratoriya"], defaultType: "Sex" },
  workshop: { types: ["Bo'lim", "Sex"], defaultType: "Bo'lim" },
  bakery: { types: ["Sex", "Bo'lim", "Ombor"], defaultType: "Sex" },
  
  // Finance
  bank: { types: ["Bo'lim", "Filial", "Xizmat turi"], defaultType: "Bo'lim" },
  insurance: { types: ["Bo'lim", "Filial", "Xizmat turi"], defaultType: "Bo'lim" },
  accounting: { types: ["Bo'lim", "Xizmat turi"], defaultType: "Bo'lim" },
  
  // IT
  it_company: { types: ["Jamoa", "Bo'lim", "Loyiha"], defaultType: "Jamoa" },
  software_development: { types: ["Jamoa", "Loyiha", "Bo'lim"], defaultType: "Jamoa" },
  web_studio: { types: ["Jamoa", "Loyiha"], defaultType: "Jamoa" },
  
  // Other
  other: { types: ["Bo'lim", "Filial"], defaultType: "Bo'lim" },
}

/**
 * Get department types for an organization type
 */
export const getDepartmentTypesForOrganizationType = (organizationType: string): string[] => {
  const config = departmentTypesByOrganizationType[organizationType]
  if (config) {
    return config.types
  }
  // Fallback to category-based types
  const orgType = organizationTypes.find(t => t.value === organizationType)
  if (orgType) {
    return departmentTypesByCategory[orgType.category] || ["Bo'lim"]
  }
  return ["Bo'lim"]
}

/**
 * Get default department type for an organization type
 */
export const getDefaultDepartmentType = (organizationType: string): string => {
  const config = departmentTypesByOrganizationType[organizationType]
  if (config) {
    return config.defaultType
  }
  return "Bo'lim"
}
