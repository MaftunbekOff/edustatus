"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const months = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
]

const days = ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sha"]

export function DatePicker({
  value,
  onChange,
  placeholder = "Sanani tanlang",
  className,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(value || new Date())
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const monthDays: (number | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      monthDays.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(i)
    }

    return monthDays
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getFullYear()}`
  }

  const daysArray = getDaysInMonth(viewDate)
  const today = new Date()

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border bg-background p-3 shadow-lg animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((day) => (
              <div
                key={day}
                className="h-8 w-8 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((day, index) => (
              <div key={index} className="h-8 w-8">
                {day !== null && (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-8 w-8 rounded-md text-sm transition-colors hover:bg-muted",
                      value &&
                        day === value.getDate() &&
                        viewDate.getMonth() === value.getMonth() &&
                        viewDate.getFullYear() === value.getFullYear() &&
                        "bg-primary text-primary-foreground hover:bg-primary",
                      !value &&
                        day === today.getDate() &&
                        viewDate.getMonth() === today.getMonth() &&
                        viewDate.getFullYear() === today.getFullYear() &&
                        "bg-muted"
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange?.(new Date())
                setIsOpen(false)
              }}
            >
              Bugun
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date) => void
  onEndDateChange?: (date: Date) => void
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder="Boshlanish sanasi"
      />
      <span className="text-muted-foreground">—</span>
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder="Tugash sanasi"
      />
    </div>
  )
}
