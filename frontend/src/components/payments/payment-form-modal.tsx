"use client"

import * as React from "react"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface PaymentFormModalProps {
  isOpen: boolean
  onClose: () => void
  students?: { id: string; fullName: string; contractNumber: string }[]
  onSuccess?: () => void
}

const paymentMethods = [
  { value: "bank", label: "Bank orqali" },
  { value: "cash", label: "Naqd pul" },
  { value: "click", label: "Click" },
  { value: "payme", label: "Payme" },
  { value: "other", label: "Boshqa" },
]

// Mock students data
const mockStudents = [
  { id: "1", fullName: "Aliyev Anvar Abdullaevich", contractNumber: "CT-2024-00123" },
  { id: "2", fullName: "Valiyeva Dilnoza Karimovna", contractNumber: "CT-2024-00145" },
  { id: "3", fullName: "Karimov Bobur Rahimovich", contractNumber: "CT-2024-00098" },
  { id: "4", fullName: "Najimova Nigora Bahodirovna", contractNumber: "CT-2024-00167" },
  { id: "5", fullName: "Rahimov Jahongir Toshmatovich", contractNumber: "CT-2024-00189" },
]

export function PaymentFormModal({
  isOpen,
  onClose,
  students = mockStudents,
  onSuccess,
}: PaymentFormModalProps) {
  const [formData, setFormData] = React.useState({
    studentId: "",
    amount: 0,
    paymentMethod: "bank",
    paymentDate: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showStudentList, setShowStudentList] = React.useState(false)

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedStudent = students.find((s) => s.id === formData.studentId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
      onClose()
      // Reset form
      setFormData({
        studentId: "",
        amount: 0,
        paymentMethod: "bank",
        paymentDate: new Date().toISOString().split("T")[0],
        description: "",
      })
    }, 1000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }))
  }

  const selectStudent = (student: { id: string; fullName: string }) => {
    setFormData((prev) => ({ ...prev, studentId: student.id }))
    setSearchQuery(student.fullName)
    setShowStudentList(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yangi to'lov qo'shish"
      description="To'lov ma'lumotlarini kiriting"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Talaba <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              placeholder="Talaba ismi yoki shartnoma raqamini kiriting..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowStudentList(true)
              }}
              onFocus={() => setShowStudentList(true)}
              required
            />
            {showStudentList && searchQuery && !selectedStudent && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => selectStudent(student)}
                    >
                      <div className="font-medium">{student.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.contractNumber}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Talaba topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedStudent && (
            <div className="flex items-center justify-between rounded-lg border p-2">
              <div>
                <p className="text-sm font-medium">{selectedStudent.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedStudent.contractNumber}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, studentId: "" }))
                  setSearchQuery("")
                }}
              >
                O'zgartirish
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              To'lov summasi <span className="text-red-500">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              placeholder="1000000"
              value={formData.amount || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              To'lov usuli <span className="text-red-500">*</span>
            </label>
            <Select
              name="paymentMethod"
              options={paymentMethods}
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              To'lov sanasi <span className="text-red-500">*</span>
            </label>
            <Input
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Izoh</label>
            <Input
              name="description"
              placeholder="Qo'shimcha ma'lumot..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading || !formData.studentId}>
            {isLoading ? "Saqlanmoqda..." : "Qo'shish"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
