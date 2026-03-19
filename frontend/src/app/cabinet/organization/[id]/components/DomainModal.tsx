"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalFooter } from "@/components/ui/modal"
import { Plus, Loader2 } from "lucide-react"
import { customDomainsApi, collegesApi, ApiError } from "@/lib/api"

interface DomainModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  token: string
  currentSubdomain?: string | null
  onSuccess: () => void
}

export function DomainModal({ isOpen, onClose, organizationId, token, currentSubdomain, onSuccess }: DomainModalProps) {
  const [newDomain, setNewDomain] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setDomainError] = useState("")
  
  // Agar subdomain mavjud bo'lsa, checkbox ko'rsatilmaydi
  const hasSubdomain = !!currentSubdomain
  const [isSubdomain, setIsSubdomain] = useState(false)

  const handleClose = () => {
    onClose()
    setDomainError("")
    setNewDomain("")
    setIsSubdomain(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDomain.trim()) {
      setDomainError("Domain nomini kiriting")
      return
    }

    // Domain format validation
    if (isSubdomain && !hasSubdomain) {
      // Subdomain format: only lowercase letters, numbers, hyphens
      const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/
      if (!subdomainRegex.test(newDomain.toLowerCase())) {
        setDomainError("Subdomain faqat kichik harflar, raqamlar va chiziqchalar dan iborat bo'lishi kerak")
        return
      }
    } else {
      // Full domain format
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/
      if (!domainRegex.test(newDomain.toLowerCase())) {
        setDomainError("Domain formati noto'g'ri")
        return
      }
    }

    try {
      setSubmitting(true)
      setDomainError("")
      
      if (isSubdomain && !hasSubdomain) {
        // Update subdomain on the college
        await collegesApi.update(token, organizationId, {
          subdomain: newDomain.toLowerCase().trim(),
        })
      } else {
        // Create custom domain
        await customDomainsApi.create(token, organizationId, {
          domain: newDomain.toLowerCase().trim(),
        })
      }
      
      onSuccess()
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setDomainError(err.message)
      } else {
        setDomainError("Xatolik yuz berdi")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Yangi domain qo'shish"
      description="Tashkilot uchun yangi domain yoki subdomain kiriting"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {/* Domain type checkbox - faqat subdomain mavjud bo'lmasa ko'rsatiladi */}
        {!hasSubdomain && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSubdomain"
              checked={isSubdomain}
              onChange={(e) => setIsSubdomain(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isSubdomain" className="text-sm font-medium cursor-pointer">
              Subdomain sifatida qo'shish
            </label>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="domain" className="text-sm font-medium">
            {isSubdomain && !hasSubdomain ? "Subdomain nomi" : "Domain nomi"} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="domain"
              placeholder={isSubdomain && !hasSubdomain ? "mycollege" : "talaba.texnikum.uz"}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={submitting}
            />
            {isSubdomain && !hasSubdomain && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .edustatus.uz
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSubdomain && !hasSubdomain
              ? "Subdomain nomini kiriting (masalan: mycollege). Natijada: mycollege.edustatus.uz"
              : "To'liq domain nomini kiriting (masalan: talaba.texnikum.uz)"
            }
          </p>
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