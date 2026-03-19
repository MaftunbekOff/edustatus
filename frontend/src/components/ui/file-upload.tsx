"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Upload, X, File, FileText, ImageIcon, FileSpreadsheet } from "lucide-react"

interface FileUploadProps {
  value?: File[]
  onChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

export function FileUpload({
  value = [],
  onChange,
  accept,
  multiple = false,
  maxFiles = 5,
  maxSize = 10,
  className,
  disabled,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = []
    setError(null)

    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`${file.name} fayli juda katta (max: ${maxSize}MB)`)
        continue
      }

      // Check max files
      if (validFiles.length + value.length >= maxFiles) {
        setError(`Maksimal ${maxFiles} ta fayl yuklash mumkin`)
        break
      }

      validFiles.push(file)
    }

    return validFiles
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(files)

    if (validFiles.length > 0) {
      onChange?.(multiple ? [...value, ...validFiles] : [validFiles[0]])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = validateFiles(files)

    if (validFiles.length > 0) {
      onChange?.(multiple ? [...value, ...validFiles] : [validFiles[0]])
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange?.(newFiles)
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.includes("spreadsheet") || type.includes("excel"))
      return <FileSpreadsheet className="h-5 w-5" />
    if (type.includes("text") || type.includes("document"))
      return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            Fayllarni bu yerga tashlang
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            yoki tanlash uchun bosing
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Maksimal {maxSize}MB gacha, {maxFiles} tagacha fayl
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {getFileIcon(file)}
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simple file input button
interface FileInputProps {
  onFileSelect: (files: File[]) => void
  accept?: string
  multiple?: boolean
  children?: React.ReactNode
  className?: string
}

export function FileInput({
  onFileSelect,
  accept,
  multiple,
  children,
  className,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    onFileSelect(files)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        {children || (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Fayl tanlash
          </>
        )}
      </Button>
    </>
  )
}
