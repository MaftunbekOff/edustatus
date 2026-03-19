// Shared components module
// Re-export commonly used components from a single location

// UI Components
export { Button } from '@/components/ui/button'
export { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
export { Badge } from '@/components/ui/badge'
export { Input } from '@/components/ui/input'
export { Modal, ModalFooter } from '@/components/ui/modal'
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Dashboard Components
export { StatsCard } from '@/components/dashboard/stats-card'

// Layout Components
export { Header } from '@/components/layout/header'
export { Sidebar } from '@/components/layout/sidebar'
export { CabinetHeader } from '@/components/layout/cabinet-header'
export { CabinetSidebar } from '@/components/layout/cabinet-sidebar'

// Cabinet Components
export { AdministratorCard } from '@/components/cabinet/AdministratorCard'
export { ChildOrganizationsCard } from '@/components/cabinet/ChildOrganizationsCard'

// Payment Components
export { PaymentFormModal } from '@/components/payments/payment-form-modal'

// Student Components
export { StudentFormModal } from '@/components/students/student-form-modal'