"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collegesApi, ApiError } from "@/lib/api"
import { Plus } from "lucide-react"
import { regions, districtsByRegion } from "@/lib/constants/regions"
import { organizationTypes } from "@/lib/constants/organization"

interface Organization {
  id: string
  name: string
  inn: string
}

interface AddOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
  organizations: Organization[]
  onSuccess: () => void
}

export function AddOrganizationModal({
  isOpen,
  onClose,
  token,
  organizations,
  onSuccess,
}: AddOrganizationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSubdomain, setHasSubdomain] = useState(false)
  const [hasParent, setHasParent] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    inn: "",
    type: "boshqa",
    isGovernment: true,
    region: "",
    district: "",
    subdomain: "",
    phone: "",
    address: "",
    parentId: "",
  })

  // Get available districts based on selected region
  const availableDistricts = formData.region ? districtsByRegion[formData.region] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate required fields
    if (!formData.name || !formData.inn || !formData.region || !formData.district || !formData.phone || !formData.address) {
      setError("Barcha majburiy maydonlarni to'ldiring")
      setLoading(false)
      return
    }

    try {
      await collegesApi.create(token, {
        name: formData.name,
        inn: formData.inn.replace(/\s/g, ""), // Remove spaces
        type: formData.type,
        isGovernment: formData.isGovernment,
        region: formData.region,
        district: formData.district,
        subdomain: hasSubdomain ? formData.subdomain || undefined : undefined,
        phone: formData.phone,
        address: formData.address,
        parentId: hasParent ? formData.parentId || undefined : undefined,
      })
      
      // Reset form
      setFormData({
        name: "",
        inn: "",
        type: "boshqa",
        isGovernment: true,
        region: "",
        district: "",
        subdomain: "",
        phone: "",
        address: "",
        parentId: "",
      })
      setHasSubdomain(false)
      setHasParent(false)
      
      onSuccess()
      onClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Tashkilot yaratishda xatolik yuz berdi")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, region: value, district: "" }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.startsWith("998")) {
      value = value.slice(3)
    }
    if (value.length > 9) {
      value = value.slice(0, 9)
    }
    let formatted = ""
    if (value.length > 0) {
      formatted = "+998 " + value.slice(0, 2)
    }
    if (value.length > 2) {
      formatted += " " + value.slice(2, 5)
    }
    if (value.length > 5) {
      formatted += " " + value.slice(5, 7)
    }
    if (value.length > 7) {
      formatted += " " + value.slice(7, 9)
    }
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const handleInnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 9) {
      value = value.slice(0, 9)
    }
    // Format: 123 456 789
    let formatted = ""
    if (value.length > 0) {
      formatted = value.slice(0, 3)
    }
    if (value.length > 3) {
      formatted += " " + value.slice(3, 6)
    }
    if (value.length > 6) {
      formatted += " " + value.slice(6, 9)
    }
    setFormData((prev) => ({ ...prev, inn: formatted }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yangi tashkilot qo'shish"
      description="Yangi tashkilot ma'lumotlarini kiriting"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tashkilot nomi */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Tashkilot nomi <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masalan: Namangan Texnologik Texnikumi"
            required
          />
        </div>

        {/* INN */}
        <div className="space-y-2">
          <label htmlFor="inn" className="text-sm font-medium">
            INN (Soliq identifikatori) <span className="text-red-500">*</span>
          </label>
          <Input
            id="inn"
            name="inn"
            value={formData.inn}
            onChange={handleInnChange}
            placeholder="123 456 789"
            maxLength={11}
            required
          />
          <p className="text-xs text-muted-foreground">
            9 ta raqamdan iborat soliq to'lovchi identifikatsiya raqami
          </p>
        </div>

        {/* Tashkilot turi, Viloyat, Tuman */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Tashkilot turi <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
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
              name="region"
              value={formData.region}
              onChange={handleRegionChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
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
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={!formData.region}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              required
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

        {/* Davlat / Xususiy */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
          <label className="text-sm font-medium">Tashkilot turi:</label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="isGovernment"
              checked={formData.isGovernment === true}
              onChange={() => setFormData((prev) => ({ ...prev, isGovernment: true }))}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">Davlat tashkiloti</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="isGovernment"
              checked={formData.isGovernment === false}
              onChange={() => setFormData((prev) => ({ ...prev, isGovernment: false }))}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm">Xususiy tashkilot</span>
          </label>
        </div>

        {/* Telefon */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon raqam <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            value={formData.phone}
            onChange={handlePhoneChange}
            maxLength={17}
            required
          />
          <p className="text-xs text-muted-foreground">
            Avtomatik format: +998 XX XXX XX XX
          </p>
        </div>

        {/* Manzil */}
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Manzil <span className="text-red-500">*</span>
          </label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Bobur ko'chasi 12-uy"
            required
          />
        </div>

        {/* Subdomain Section with Checkbox */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSubdomain}
              onChange={(e) => {
                setHasSubdomain(e.target.checked)
                if (!e.target.checked) {
                  setFormData((prev) => ({ ...prev, subdomain: "" }))
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-blue-800">Subdomain qo'shish (ixtiyoriy)</span>
          </label>
          {hasSubdomain && (
            <div className="space-y-2 pl-6">
              <label htmlFor="subdomain" className="text-sm font-medium">
                Subdomain
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="namangan-texnikum"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.edustatus.uz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faqat kichik harflar, raqamlar va chiziqcha (-) ishlatishingiz mumkin
              </p>
            </div>
          )}
        </div>

        {/* Parent Organization Section with Checkbox */}
        <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasParent}
              onChange={(e) => {
                setHasParent(e.target.checked)
                if (!e.target.checked) {
                  setFormData((prev) => ({ ...prev, parentId: "" }))
                }
              }}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-purple-800">Yuqori turuvchi tashkilot kiritish (ixtiyoriy)</span>
          </label>
          {hasParent && (
            <div className="space-y-2 pl-6">
              <label htmlFor="parentId" className="text-sm font-medium">
                Yuqori tashkilot
              </label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Tanlang...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Agar bu tashkilot boshqa tashkilotning filiali bo'lsa, tanlang
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Yuklanmoqda...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Qo'shish
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
