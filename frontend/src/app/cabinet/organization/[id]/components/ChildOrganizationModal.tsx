"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Plus, Loader2 } from "lucide-react"
import { collegesApi, ApiError } from "@/lib/api"
import { usePhoneFormat } from "@/lib/hooks"

interface ChildOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  organizationName: string
  token: string
  onSuccess: () => void
}

export function ChildOrganizationModal({ 
  isOpen, 
  onClose, 
  organizationId, 
  organizationName,
  token, 
  onSuccess 
}: ChildOrganizationModalProps) {
  const [childData, setChildData] = useState({
    name: "",
    inn: "",
    phone: "",
    address: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setChildError] = useState("")
  
  const { handlePhoneChange } = usePhoneFormat()

  const handleClose = () => {
    onClose()
    setChildData({
      name: "",
      inn: "",
      phone: "",
      address: "",
    })
    setChildError("")
  }

  const handleChildPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhoneChange(e, (value) => setChildData((prev) => ({ ...prev, phone: value })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!childData.name.trim() || !childData.inn.trim() || !childData.phone.trim() || !childData.address.trim()) {
      setChildError("Barcha majburiy maydonlarni to'ldiring")
      return
    }

    try {
      setSubmitting(true)
      setChildError("")
      
      await collegesApi.createChild(token, organizationId, {
        name: childData.name.trim(),
        inn: childData.inn.trim(),
        phone: childData.phone.trim(),
        address: childData.address.trim(),
      })
      
      onSuccess()
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setChildError(err.message)
      } else {
        setChildError("Xatolik yuz berdi")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Yangi quyi tashkilot qo'shish"
      description={`${organizationName} tashkilotiga quyi tashkilot qo'shish`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="childName" className="text-sm font-medium">
            Tashkilot nomi <span className="text-red-500">*</span>
          </label>
          <Input
            id="childName"
            placeholder="Masalan: 1-son filial"
            value={childData.name}
            onChange={(e) => setChildData({ ...childData, name: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="childInn" className="text-sm font-medium">
            INN (Soliq identifikatori) <span className="text-red-500">*</span>
          </label>
          <Input
            id="childInn"
            placeholder="123456789"
            maxLength={9}
            value={childData.inn}
            onChange={(e) => setChildData({ ...childData, inn: e.target.value })}
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            9 ta raqamdan iborat soliq to'lovchi identifikatsiya raqami
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="childPhone" className="text-sm font-medium">
            Telefon raqam <span className="text-red-500">*</span>
          </label>
          <Input
            id="childPhone"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={childData.phone}
            onChange={handleChildPhoneChange}
            disabled={submitting}
            maxLength={17}
          />
          <p className="text-xs text-muted-foreground">
            Avtomatik format: +998 XX XXX XX XX
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="childAddress" className="text-sm font-medium">
            Manzil <span className="text-red-500">*</span>
          </label>
          <Input
            id="childAddress"
            placeholder="Namangan shahar, Bobur ko'chasi 12-uy"
            value={childData.address}
            onChange={(e) => setChildData({ ...childData, address: e.target.value })}
            disabled={submitting}
          />
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
                Qo'shilmoqda...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Qo'shish
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}