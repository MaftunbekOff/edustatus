// Shared hooks module
// Re-export commonly used hooks from a single location

// Auth
export { useAuth } from '@/lib/auth-context'

// Custom hooks
export { useCollegeData } from '@/lib/hooks/useCollegeData'
export { usePhoneFormat } from '@/lib/hooks/usePhoneFormat'

// Types
export type { College, CollegeAdmin, ChildCollege, CustomDomain, CollegeStats } from '@/lib/hooks/useCollegeData'