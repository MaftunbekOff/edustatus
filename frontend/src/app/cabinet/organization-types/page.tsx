"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Building2,
  Edit,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react"
import {
  organizationTypes,
  organizationCategories,
  getOrganizationTypeByValue,
  departmentTypesByOrganizationType,
} from "@/lib/constants/organization"
import {
  navigationByCategory,
  organizationTypeToCategory,
  departmentLabelsByCategory,
  clientLabelsByCategory,
  staffLabelsByCategory,
} from "@/lib/constants/navigation"
import { authApi, organizationsApi, ApiError } from "@/lib/api"

interface OrganizationTypeConfig {
  type: string
  category: string
  departmentTypes: string[]
  defaultDepartmentType: string
  clientLabel: { singular: string; plural: string }
  staffLabel: { singular: string; plural: string }
  departmentLabel: { singular: string; plural: string }
}

// Default configuration
const defaultConfig: Record<string, OrganizationTypeConfig> = Object.fromEntries(
  organizationTypes.map((orgType) => {
    const category = orgType.category
    const deptConfig = departmentTypesByOrganizationType[orgType.value] || {
      types: departmentLabelsByCategory[category]?.singular ? [departmentLabelsByCategory[category].singular] : ["Bo'lim"],
      defaultType: departmentLabelsByCategory[category]?.singular || "Bo'lim",
    }
    
    return [
      orgType.value,
      {
        type: orgType.value,
        category: category,
        departmentTypes: deptConfig.types,
        defaultDepartmentType: deptConfig.defaultType,
        clientLabel: clientLabelsByCategory[category] || { singular: "Mijoz", plural: "Mijozlar" },
        staffLabel: staffLabelsByCategory[category] || { singular: "Xodim", plural: "Xodimlar" },
        departmentLabel: departmentLabelsByCategory[category] || { singular: "Bo'lim", plural: "Bo'limlar" },
      },
    ]
  })
)

export default function OrganizationTypesPage() {
  const [config, setConfig] = useState<Record<string, OrganizationTypeConfig>>(defaultConfig)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editedConfig, setEditedConfig] = useState<OrganizationTypeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [newDepartmentType, setNewDepartmentType] = useState("")

  // Filter organization types by category
  const filteredTypes = activeCategory === "all" 
    ? organizationTypes 
    : organizationTypes.filter(t => t.category === activeCategory)

  const handleStartEditing = (type: string) => {
    setEditingType(type)
    setEditedConfig({ ...config[type] })
    setNewDepartmentType("")
  }

  const handleCancelEditing = () => {
    setEditingType(null)
    setEditedConfig(null)
    setNewDepartmentType("")
  }

  const handleSaveConfig = async (type: string) => {
    if (!editedConfig) return
    
    setIsLoading(true)
    try {
      // In a real implementation, this would save to the backend
      // For now, we'll just update the local state
      setConfig(prev => ({
        ...prev,
        [type]: editedConfig,
      }))
      setEditingType(null)
      setEditedConfig(null)
      
      // Show success message
      alert("Sozlamalar saqlandi!")
    } catch (error) {
      console.error("Failed to save config:", error)
      alert("Saqlashda xatolik yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDepartmentType = () => {
    if (!newDepartmentType.trim() || !editedConfig) return
    
    if (!editedConfig.departmentTypes.includes(newDepartmentType.trim())) {
      setEditedConfig({
        ...editedConfig,
        departmentTypes: [...editedConfig.departmentTypes, newDepartmentType.trim()],
      })
    }
    setNewDepartmentType("")
  }

  const handleRemoveDepartmentType = (index: number) => {
    if (!editedConfig) return
    
    const newTypes = editedConfig.departmentTypes.filter((_, i) => i !== index)
    setEditedConfig({
      ...editedConfig,
      departmentTypes: newTypes,
      defaultDepartmentType: newTypes.includes(editedConfig.defaultDepartmentType) 
        ? editedConfig.defaultDepartmentType 
        : newTypes[0] || "Bo'lim",
    })
  }

  const handleSetDefaultDepartmentType = (type: string) => {
    if (!editedConfig) return
    setEditedConfig({
      ...editedConfig,
      defaultDepartmentType: type,
    })
  }

  const handleLabelChange = (field: 'clientLabel' | 'staffLabel' | 'departmentLabel', key: 'singular' | 'plural', value: string) => {
    if (!editedConfig) return
    setEditedConfig({
      ...editedConfig,
      [field]: {
        ...editedConfig[field],
        [key]: value,
      },
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tashkilot turlari sozlamalari</h1>
          <p className="text-muted-foreground">
            Har bir tashkilot turi uchun bo'limlar va navigatsiyani sozlang
          </p>
        </div>
        <Button variant="outline" onClick={() => setConfig(defaultConfig)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Standartga qaytarish
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
            >
              Barchasi
            </Button>
            {organizationCategories.map((category) => (
              <Button
                key={category.value}
                variant={activeCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Types Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredTypes.map((orgType) => {
          const currentConfig = config[orgType.value]
          const isEditing = editingType === orgType.value
          const displayConfig = isEditing && editedConfig ? editedConfig : currentConfig
          const category = organizationCategories.find(c => c.value === orgType.category)

          return (
            <Card key={orgType.value} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{orgType.label}</CardTitle>
                      <CardDescription>
                        {category?.label} • {orgType.value}
                      </CardDescription>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                        <X className="mr-2 h-4 w-4" />
                        Bekor
                      </Button>
                      <Button size="sm" onClick={() => handleSaveConfig(orgType.value)} disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Saqlash
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleStartEditing(orgType.value)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Tahrirlash
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Department Types */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Bo'lim turlari</label>
                  <div className="flex flex-wrap gap-2">
                    {displayConfig.departmentTypes.map((type, index) => {
                      const isDefault = type === displayConfig.defaultDepartmentType
                      return (
                        <Badge
                          key={index}
                          variant={isDefault ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => isEditing && handleSetDefaultDepartmentType(type)}
                        >
                          {type}
                          {isDefault && " (standart)"}
                          {isEditing && displayConfig.departmentTypes.length > 1 && (
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveDepartmentType(index)
                              }}
                            />
                          )}
                        </Badge>
                      )
                    })}
                    {isEditing && (
                      <div className="flex gap-1">
                        <Input
                          className="h-6 w-24 text-xs"
                          placeholder="Yangi..."
                          value={newDepartmentType}
                          onChange={(e) => setNewDepartmentType(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddDepartmentType()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleAddDepartmentType}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Labels */}
                <div className="grid gap-4 grid-cols-3">
                  {/* Department Label */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bo'lim nomi</label>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          className="h-8"
                          placeholder="Birlik"
                          value={displayConfig.departmentLabel.singular}
                          onChange={(e) => handleLabelChange('departmentLabel', 'singular', e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Ko'plik"
                          value={displayConfig.departmentLabel.plural}
                          onChange={(e) => handleLabelChange('departmentLabel', 'plural', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p>{displayConfig.departmentLabel.singular} / {displayConfig.departmentLabel.plural}</p>
                      </div>
                    )}
                  </div>

                  {/* Client Label */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mijoz nomi</label>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          className="h-8"
                          placeholder="Birlik"
                          value={displayConfig.clientLabel.singular}
                          onChange={(e) => handleLabelChange('clientLabel', 'singular', e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Ko'plik"
                          value={displayConfig.clientLabel.plural}
                          onChange={(e) => handleLabelChange('clientLabel', 'plural', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p>{displayConfig.clientLabel.singular} / {displayConfig.clientLabel.plural}</p>
                      </div>
                    )}
                  </div>

                  {/* Staff Label */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Xodim nomi</label>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          className="h-8"
                          placeholder="Birlik"
                          value={displayConfig.staffLabel.singular}
                          onChange={(e) => handleLabelChange('staffLabel', 'singular', e.target.value)}
                        />
                        <Input
                          className="h-8"
                          placeholder="Ko'plik"
                          value={displayConfig.staffLabel.plural}
                          onChange={(e) => handleLabelChange('staffLabel', 'plural', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p>{displayConfig.staffLabel.singular} / {displayConfig.staffLabel.plural}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Preview */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Navigatsiya</label>
                  <div className="flex flex-wrap gap-1">
                    {navigationByCategory[orgType.category]?.slice(0, 6).map((navItem, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {navItem.name}
                      </Badge>
                    ))}
                    {(navigationByCategory[orgType.category]?.length || 0) > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{(navigationByCategory[orgType.category]?.length || 0) - 6} ta
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Ma'lumot</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Bu sozlamalar tashkilot turiga qarab sidebar menyusida ko'rsatiladigan bo'limlarni va 
                tizimda ishlatiladigan terminlarni boshqaradi. O'zgarishlar yangi tashkilotlar uchun 
                avtomatik qo'llaniladi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
