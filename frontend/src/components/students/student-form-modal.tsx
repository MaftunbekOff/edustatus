"use client"

import * as React from "react"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface StudentFormModalProps {
  isOpen: boolean
  onClose: () => void
  student?: {
    id: string
    fullName: string
    pinfl: string
    contractNumber: string
    groupId: string
    phone: string
    email: string
    totalAmount: number
  }
  onSuccess?: () => void
}

const groups = [
  { value: "1", label: "101-A - Hamshiralik ishi" },
  { value: "2", label: "102-B - Akkushelik ishi" },
  { value: "3", label: "103-V - Farmatsiya" },
  { value: "4", label: "201-A - Hamshiralik ishi (2-kurs)" },
  { value: "5", label: "202-B - Akkushelik ishi (2-kurs)" },
]

const specialties = [
  { value: "hamshiralik", label: "Hamshiralik ishi" },
  { value: "akkushelik", label: "Akkushelik ishi" },
  { value: "farmatsiya", label: "Farmatsiya" },
  { value: "stomotologiya", label: "Stomotologiya" },
]

export function StudentFormModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: StudentFormModalProps) {
  const [formData, setFormData] = React.useState({
    fullName: student?.fullName || "",
    pinfl: student?.pinfl || "",
    contractNumber: student?.contractNumber || "",
    groupId: student?.groupId || "",
    phone: student?.phone || "",
    email: student?.email || "",
    totalAmount: student?.totalAmount || 5000000,
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
      onClose()
    }, 1000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalAmount" ? Number(value) : value,
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
      description="Talaba ma'lumotlarini kiriting"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">
              F.I.O <span className="text-red-500">*</span>
            </label>
            <Input
              name="fullName"
              placeholder="Aliyev Anvar Abdullaevich"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              PINFL (JSHSHIR) <span className="text-red-500">*</span>
            </label>
            <Input
              name="pinfl"
              placeholder="14 raqamli PINFL"
              value={formData.pinfl}
              onChange={handleChange}
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Shartnoma raqami <span className="text-red-500">*</span>
            </label>
            <Input
              name="contractNumber"
              placeholder="CT-2024-XXXXX"
              value={formData.contractNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Guruh <span className="text-red-500">*</span>
            </label>
            <Select
              name="groupId"
              options={groups}
              placeholder="Guruhni tanlang"
              value={formData.groupId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Kontrakt summasi <span className="text-red-500">*</span>
            </label>
            <Input
              name="totalAmount"
              type="number"
              placeholder="5000000"
              value={formData.totalAmount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefon</label>
            <Input
              name="phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saqlanmoqda..." : student ? "Saqlash" : "Qo'shish"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
