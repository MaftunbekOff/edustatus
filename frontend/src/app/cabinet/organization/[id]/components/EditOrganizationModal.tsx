"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Check, Loader2 } from "lucide-react"
import { collegesApi, ApiError } from "@/lib/api"
import { 
  regions, 
  districtsByRegion, 
  organizationTypes,
} from "@/lib/constants"
import { usePhoneFormat } from "@/lib/hooks"
import { Organization } from "@/lib/hooks/useOrganizationData"

interface EditOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  organization: Organization | null
  organizationId: string
  token: string
  onSuccess: () => void
}

/**
 * Formats INN string as XXX XXX XXX
 */
const formatInnDisplay = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  
  // Format as XXX XXX XXX while typing
  const parts = []
  if (cleaned.length > 0) parts.push(cleaned.slice(0, 3))
  if (cleaned.length > 3) parts.push(cleaned.slice(3, 6))
  if (cleaned.length > 6) parts.push(cleaned.slice(6, 9))
  
  return parts.join(" ")
}

/**
 * Removes formatting from INN to get raw digits
 */
const getRawInn = (formattedInn: string): string => {
  return formattedInn.replace(/\D/g, "")
}

export function EditOrganizationModal({ 
  isOpen, 
  onClose, 
  organization, 
  organizationId, 
  token, 
  onSuccess 
}: EditOrganizationModalProps) {
  const [editData, setEditData] = useState({
    name: "",
    inn: "",
    type: "boshqa",
    isGovernment: true,
    region: "",
    district: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setEditError] = useState("")
  
  const { formatPhoneNumber, handlePhoneChange } = usePhoneFormat()

  // Get districts for selected region
  const availableDistricts = editData.region ? (districtsByRegion[editData.region] || []) : []

  // Populate form when organization data is available or modal opens
  useEffect(() => {
    if (organization && isOpen) {
      setEditData({
        name: organization.name || "",
        inn: formatInnDisplay(organization.inn || ""),
        type: organization.type || "boshqa",
        isGovernment: organization.isGovernment ?? true,
        region: organization.region || "",
        district: organization.district || "",
        subdomain: organization.subdomain || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
      })
    }
  }, [organization, isOpen])

  const handleClose = () => {
    onClose()
    setEditData({
      name: "",
      inn: "",
      type: "boshqa",
      isGovernment: true,
      region: "",
      district: "",
      subdomain: "",
      email: "",
      phone: "",
      address: "",
    })
    setEditError("")
  }

  const handleEditPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhoneChange(e, (value) => setEditData((prev) => ({ ...prev, phone: value })))
  }

  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = getRawInn(e.target.value)
    // Only allow up to 9 digits
    if (rawValue.length <= 9) {
      const formatted = formatInnDisplay(rawValue)
      setEditData((prev) => ({ ...prev, inn: formatted }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setEditError("")
      
      // Get raw INN without formatting
      const rawInn = getRawInn(editData.inn)
      
      // Only send fields that have values
      const dataToUpdate: Record<string, string | boolean> = {}
      if (editData.name.trim()) dataToUpdate.name = editData.name.trim()
      if (rawInn.trim()) dataToUpdate.inn = rawInn.trim()
      if (editData.type) dataToUpdate.type = editData.type
      dataToUpdate.isGovernment = editData.isGovernment
      if (editData.region) dataToUpdate.region = editData.region
      if (editData.district) dataToUpdate.district = editData.district
      if (editData.subdomain.trim()) dataToUpdate.subdomain = editData.subdomain.trim()
      if (editData.email.trim()) dataToUpdate.email = editData.email.trim()
      if (editData.phone.trim()) dataToUpdate.phone = editData.phone.trim()
      if (editData.address.trim()) dataToUpdate.address = editData.address.trim()
      
      await collegesApi.update(token, organizationId, dataToUpdate)
      
      onSuccess()
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setEditError(err.message)
      } else {
        setEditError("Xatolik yuz berdi")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ma'lumotlarni tahrirlash"
      description="Tashkilot ma'lumotlarini yangilang"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Tashkilot nomi <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            placeholder="Masalan: Namangan Texnologik Texnikumi"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="inn" className="text-sm font-medium">
            INN (Soliq identifikatori) <span className="text-red-500">*</span>
          </label>
          <Input
            id="inn"
            placeholder="123 456 789"
            maxLength={11}
            value={editData.inn}
            onChange={handleInnChange}
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            Avtomatik format: XXX XXX XXX (9 ta raqam)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Tashkilot turi <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
              disabled={submitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {organizationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium">
              Viloyat <span className="text-red-500">*</span>
            </label>
            <select
              id="region"
              value={editData.region}
              onChange={(e) => setEditData({ ...editData, region: e.target.value, district: "" })}
              disabled={submitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Tanlang...</option>
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="district" className="text-sm font-medium">
              Tuman <span className="text-red-500">*</span>
            </label>
            <select
              id="district"
              value={editData.district}
              onChange={(e) => setEditData({ ...editData, district: e.target.value })}
              disabled={submitting || !editData.region}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <option value="">Tanlang...</option>
              {availableDistricts.map((district) => (
                <option key={district.value} value={district.value}>
                  {district.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Davlat/Shaxsiy checkbox */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
          <label className="text-sm font-medium">Tashkilot turi:</label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="editIsGovernment"
              checked={editData.isGovernment === true}
              onChange={() => setEditData({ ...editData, isGovernment: true })}
              disabled={submitting}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">Davlat tashkiloti</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="editIsGovernment"
              checked={editData.isGovernment === false}
              onChange={() => setEditData({ ...editData, isGovernment: false })}
              disabled={submitting}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">Xususiy tashkilot</span>
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon raqam <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={editData.phone}
            onChange={handleEditPhoneChange}
            disabled={submitting}
            maxLength={17}
          />
          <p className="text-xs text-muted-foreground">
            Avtomatik format: +998 XX XXX XX XX
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Manzil <span className="text-red-500">*</span>
          </label>
          <Input
            id="address"
            placeholder="Namangan shahar, Bobur ko'chasi 12-uy"
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
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
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saqlash
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}