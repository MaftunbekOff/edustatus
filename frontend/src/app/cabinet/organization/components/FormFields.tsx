"use client"

import { Input } from "@/components/ui/input"
import { regions, districtsByRegion, organizationTypes } from "@/lib/constants"

interface FormData {
  name: string
  inn: string
  type: string
  isGovernment: boolean
  region: string
  district: string
  phone: string
  address: string
  hasSubdomain: boolean
  subdomain: string
  hasParent: boolean
  parentId: string
}

interface FormFieldsProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  availableDistricts: { value: string; label: string }[]
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  organizations: { id: string; name: string; inn: string }[]
  submitting: boolean
}

export function FormFields({
  formData,
  setFormData,
  availableDistricts,
  onPhoneChange,
  organizations,
  submitting,
}: FormFieldsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Tashkilot nomi <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Masalan: Namangan Texnologik Texnikumi"
          value={formData.name}
          onChange={handleInputChange}
          disabled={submitting}
        />
      </div>

      {/* INN Field */}
      <div className="space-y-2">
        <label htmlFor="inn" className="text-sm font-medium">
          INN (Soliq identifikatori) <span className="text-red-500">*</span>
        </label>
        <Input
          id="inn"
          name="inn"
          placeholder="123456789"
          maxLength={9}
          value={formData.inn}
          onChange={handleInputChange}
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">
          9 ta raqamdan iborat soliq to'lovchi identifikatsiya raqami
        </p>
      </div>

      {/* Type, Region, District */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Tashkilot turi <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
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
            value={formData.region}
            onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value, district: "" }))}
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
            value={formData.district}
            onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
            disabled={submitting || !formData.region}
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

      {/* Government Type */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
        <label className="text-sm font-medium">Tashkilot turi:</label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="isGovernment"
            checked={formData.isGovernment === true}
            onChange={() => setFormData((prev) => ({ ...prev, isGovernment: true }))}
            disabled={submitting}
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
            disabled={submitting}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm">Xususiy tashkilot</span>
        </label>
      </div>

      {/* Phone */}
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
          onChange={onPhoneChange}
          disabled={submitting}
          maxLength={17}
        />
        <p className="text-xs text-muted-foreground">
          Avtomatik format: +998 XX XXX XX XX
        </p>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Manzil <span className="text-red-500">*</span>
        </label>
        <Input
          id="address"
          name="address"
          placeholder="Namangan shahar, Bobur ko'chasi 12-uy"
          value={formData.address}
          onChange={handleInputChange}
          disabled={submitting}
        />
      </div>

      {/* Subdomain Section */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasSubdomain}
            onChange={(e) => setFormData((prev) => ({ ...prev, hasSubdomain: e.target.checked, subdomain: e.target.checked ? prev.subdomain : "" }))}
            disabled={submitting}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-blue-800">Subdomain qo'shish (ixtiyoriy)</span>
        </label>
        {formData.hasSubdomain && (
          <div className="space-y-2 pl-6">
            <label htmlFor="subdomain" className="text-sm font-medium">
              Subdomain
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                name="subdomain"
                placeholder="masalan: namangan-texnikum"
                value={formData.subdomain}
                onChange={handleInputChange}
                disabled={submitting}
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

      {/* Parent Organization Section */}
      <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasParent}
            onChange={(e) => setFormData((prev) => ({ ...prev, hasParent: e.target.checked, parentId: e.target.checked ? prev.parentId : "" }))}
            disabled={submitting}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-purple-800">Yuqori turuvchi tashkilot kiritish (ixtiyoriy)</span>
        </label>
        {formData.hasParent && (
          <div className="space-y-2 pl-6">
            <label htmlFor="parentId" className="text-sm font-medium">
              Yuqori tashkilot
            </label>
            <select
              id="parentId"
              value={formData.parentId}
              onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
              disabled={submitting}
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
    </div>
  )
}