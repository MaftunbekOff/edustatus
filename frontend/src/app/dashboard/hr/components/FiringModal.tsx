"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { UserMinus, Building, DollarSign } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

/**
 * Employee data for firing modal
 */
export interface EmployeeForFiring {
  id: string
  fullName: string
  position: string
  department: string
  salary: number
  hireDate: string
  contractEndDate?: string
}

/**
 * Firing form data interface
 */
export interface FiringFormData {
  employeeId: string
  reason: string
  lastWorkingDay: string
  notes: string
}

interface FiringModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FiringFormData) => void
  employee: EmployeeForFiring | null
}

const firingReasons = [
  { value: "iste'foga", label: "Iste'foga chiqdi" },
  { value: "shartnoma_tugadi", label: "Shartnoma muddati tugadi" },
  { value: "pension_yosh", label: "Pension yoshga yetdi" },
  { value: "boshqa", label: "Boshqa sabab" },
]

export function FiringModal({ isOpen, onClose, onSubmit, employee }: FiringModalProps) {
  const [formData, setFormData] = useState({
    reason: "",
    lastWorkingDay: new Date().toISOString().split('T')[0],
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!employee || !formData.reason) return
    onSubmit({ employeeId: employee.id, ...formData })
    setFormData({ reason: "", lastWorkingDay: new Date().toISOString().split('T')[0], notes: "" })
    onClose()
  }

  if (!employee) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ishdan bo'shatish">
      <div className="space-y-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Avatar name={employee.fullName} size="lg" />
              <div>
                <h3 className="font-semibold">{employee.fullName}</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {employee.department} - {employee.position}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(employee.salary)} | {formatDate(employee.hireDate)} dan
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bo'shatish sababi *</label>
            <Select
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              options={firingReasons}
              placeholder="Sababni tanlang"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Oxirgi ish kuni *</label>
            <Input
              type="date"
              value={formData.lastWorkingDay}
              onChange={(e) => handleInputChange("lastWorkingDay", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Izohlar</label>
            <Input
              placeholder="Qo'shimcha izohlar..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!formData.reason}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Ishdan bo'shatish
          </Button>
        </div>
      </div>
    </Modal>
  )
}
