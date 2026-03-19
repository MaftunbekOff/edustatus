import { useCallback } from "react"

// Telefon raqamni formatlash hooki
export function usePhoneFormat() {
  const formatPhoneNumber = useCallback((value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    
    // If empty, return empty
    if (digits.length === 0) return ""
    
    // If user is typing local number (without 998), prepend 998
    let fullDigits = digits
    if (!digits.startsWith("998") && digits.length <= 9) {
      fullDigits = "998" + digits
    }
    
    // Format: +998 XX XXX XX XX
    let formatted = "+998"
    
    if (fullDigits.length > 3) {
      formatted += " " + fullDigits.slice(3, 5)
    }
    if (fullDigits.length > 5) {
      formatted += " " + fullDigits.slice(5, 8)
    }
    if (fullDigits.length > 8) {
      formatted += " " + fullDigits.slice(8, 10)
    }
    if (fullDigits.length > 10) {
      formatted += " " + fullDigits.slice(10, 12)
    }
    
    return formatted
  }, [])

  const handlePhoneChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }, [formatPhoneNumber])

  return {
    formatPhoneNumber,
    handlePhoneChange,
  }
}