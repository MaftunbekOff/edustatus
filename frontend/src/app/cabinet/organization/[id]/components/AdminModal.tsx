"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Plus, Check, Loader2 } from "lucide-react"
import { collegesApi, ApiError } from "@/lib/api"
import { usePhoneFormat } from "@/lib/hooks"
import { adminRoles } from "@/lib/constants"
import { OrganizationAdmin } from "@/lib/hooks/useOrganizationData"

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  organizationName: string
  token: string
  editingAdmin: OrganizationAdmin | null
  onSuccess: () => void
}

export function AdminModal({ 
  isOpen, 
  onClose, 
  organizationId, 
  organizationName,
  token,
  editingAdmin,
  onSuccess 
}: AdminModalProps) {
  const [adminData, setAdminData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setAdminError] = useState("")
  
  const { handlePhoneChange } = usePhoneFormat()

  // Populate form when editing
  useEffect(() => {
    if (editingAdmin) {
      setAdminData({
        fullName: editingAdmin.fullName,
        email: editingAdmin.email,
        phone: editingAdmin.phone || "",
        password: "", // Don't show password
        role: editingAdmin.role,
      })
    } else {
      setAdminData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      })
    }
  }, [editingAdmin])

  const handleClose = () => {
    onClose()
    setAdminData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "admin",
    })
    setAdminError("")
  }

  const handleAdminPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhoneChange(e, (value) => setAdminData((prev) => ({ ...prev, phone: value })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adminData.fullName.trim() || !adminData.email.trim()) {
      setAdminError("Ism va email maydonlari to'ldirilishi shart")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(adminData.email)) {
      setAdminError("Email formati noto'g'ri")
      return
    }

    // Password validation (min 6 characters) - only for new admin
    if (!editingAdmin && adminData.password.length < 6) {
      setAdminError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }

    // If password entered during edit, check length
    if (editingAdmin && adminData.password && adminData.password.length < 6) {
      setAdminError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }

    try {
      setSubmitting(true)
      setAdminError("")
      
      if (editingAdmin) {
        // Update existing admin
        const updateData: Record<string, string | null> = {
          fullName: adminData.fullName.trim(),
          email: adminData.email.trim(),
          phone: adminData.phone.trim() || null,
          role: adminData.role,
        }
        // Only update password if provided
        if (adminData.password) {
          updateData.password = adminData.password
        }
        
        await collegesApi.updateAdmin(token, organizationId, editingAdmin.id, updateData)
      } else {
        // Create new admin
        await collegesApi.createAdmin(token, organizationId, {
          fullName: adminData.fullName.trim(),
          email: adminData.email.trim(),
          phone: adminData.phone.trim() || null,
          password: adminData.password,
          role: adminData.role,
        })
      }
      
      onSuccess()
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setAdminError(err.message)
      } else {
        setAdminError("Xatolik yuz berdi")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingAdmin ? "Administratorni tahrirlash" : "Yangi administrator qo'shish"}
      description={editingAdmin 
        ? `${organizationName} tashkiloti administratorini tahrirlash`
        : `${organizationName} tashkilotiga yangi administrator qo'shish`
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="adminFullName" className="text-sm font-medium">
            To'liq ism <span className="text-red-500">*</span>
          </label>
          <Input
            id="adminFullName"
            placeholder="Masalan: Aliyev Valijon"
            value={adminData.fullName}
            onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="adminEmail" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="adminEmail"
            type="email"
            placeholder="admin@tashkilot.uz"
            value={adminData.email}
            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="adminPhone" className="text-sm font-medium">
            Telefon raqam
          </label>
          <Input
            id="adminPhone"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={adminData.phone}
            onChange={handleAdminPhoneChange}
            disabled={submitting}
            maxLength={17}
          />
          <p className="text-xs text-muted-foreground">
            Avtomatik format: +998 XX XXX XX XX
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="adminPassword" className="text-sm font-medium">
            Parol {editingAdmin ? "" : <span className="text-red-500">*</span>}
          </label>
          <Input
            id="adminPassword"
            type="password"
            placeholder={editingAdmin ? "O'zgartirish uchun kiriting" : "Kamida 6 ta belgi"}
            value={adminData.password}
            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
            disabled={submitting}
          />
          {editingAdmin && (
            <p className="text-xs text-muted-foreground">
              Parolni o'zgartirish uchun yangi parol kiriting
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="adminRole" className="text-sm font-medium">
            Rol
          </label>
          <select
            id="adminRole"
            value={adminData.role}
            onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
            disabled={submitting}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {Object.entries(adminRoles).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingAdmin ? "Saqlanmoqda..." : "Qo'shilmoqda..."}
              </>
            ) : (
              <>
                {editingAdmin ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saqlash
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Qo'shish
                  </>
                )}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}