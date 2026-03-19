"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined)

function useDropdown() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown")
  }
  return context
}

interface DropdownProps {
  children: React.ReactNode
  className?: string
}

export function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
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

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export function DropdownTrigger({ children, asChild, ...props }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setIsOpen(!isOpen),
    })
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  sideOffset?: number
}

export function DropdownContent({
  children,
  align = "end",
  className,
  ...props
}: DropdownContentProps) {
  const { isOpen } = useDropdown()

  if (!isOpen) return null

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 min-w-[180px] rounded-md border bg-background p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: React.ReactNode
  destructive?: boolean
}

export function DropdownItem({
  children,
  icon,
  destructive,
  className,
  onClick,
  ...props
}: DropdownItemProps) {
  const { setIsOpen } = useDropdown()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setIsOpen(false)
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted",
        destructive && "text-red-600 hover:bg-red-50 focus:bg-red-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-muted" />
}

interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DropdownLabel({ children, className, ...props }: DropdownLabelProps) {
  return (
    <div
      className={cn("px-3 py-2 text-xs font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}
