"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

/**
 * Hiring form data interface
 */
export interface HiringFormData {
  fullName: string
  phone: string
  email: string
  department: string
  position: string
  hireDate: string
  contractType: string
  contractEndDate: string
  salary: number
}

interface HiringModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: HiringFormData) => void
}

const departments = [
  { value: "matematika", label: "Matematika" },
  { value: "fizika", label: "Fizika" },
  { value: "informatika", label: "Informatika" },
  { value: "tibbiyot", label: "Tibbiyot" },
  { value: "kimyo", label: "Kimyo" },
  { value: "mamuriyat", label: "Ma'muriyat" },
]

const positions = [
  { value: "oqituvchi", label: "O'qituvchi" },
  { value: "katta_oqituvchi", label: "Katta o'qituvchi" },
  { value: "kafedra_mudiri", label: "Kafedra mudiri" },
  { value: "buxgalter", label: "Buxgalter" },
]

const contractTypes = [
  { value: "muddatli", label: "Muddatli" },
  { value: "muddatsiz", label: "Muddatsiz" },
]

export function HiringModal({ isOpen, onClose, onSubmit }: HiringModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    department: "",
    position: "",
    hireDate: new Date().toISOString().split('T')[0],
    contractType: "muddatli",
    contractEndDate: "",
    salary: 0,
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      department: "",
      position: "",
      hireDate: new Date().toISOString().split('T')[0],
      contractType: "muddatli",
      contractEndDate: "",
      salary: 0,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ishga qabul qilish">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">F.I.O. *</label>
            <Input
              placeholder="Ahmedov Rustam Toshmatovich"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefon *</label>
            <Input
              placeholder="+998901234567"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="email@texnikum.uz"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bo'lim *</label>
            <Select
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              options={departments}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lavozim *</label>
            <Select
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              options={positions}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ishga kirish sanasi *</label>
            <Input
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleInputChange("hireDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shartnoma turi *</label>
            <Select
              value={formData.contractType}
              onChange={(e) => handleInputChange("contractType", e.target.value)}
              options={contractTypes}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Oylik maosh (so'm) *</label>
            <Input
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ishga qabul qilish
          </Button>
        </div>
      </div>
    </Modal>
  )
}
