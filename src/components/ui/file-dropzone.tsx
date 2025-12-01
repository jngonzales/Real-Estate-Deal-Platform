"use client"

import * as React from "react"
import { Upload, X, FileText, Image, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileWithPreview extends File {
  preview?: string
}

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  className?: string
  disabled?: boolean
}

export function FileDropzone({
  onFilesSelected,
  accept = "*",
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [files, setFiles] = React.useState<FileWithPreview[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = React.useCallback((fileList: FileList | File[]) => {
    setError(null)
    const newFiles: FileWithPreview[] = []
    const filesArray = Array.from(fileList)

    // Check max files
    if (files.length + filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (const file of filesArray) {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${formatFileSize(maxSize)} limit`)
        continue
      }

      // Add preview for images
      const fileWithPreview: FileWithPreview = file
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      newFiles.push(fileWithPreview)
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    }
  }, [files, maxFiles, maxSize, multiple, onFilesSelected])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    processFiles(droppedFiles)
  }, [disabled, processFiles])

  const handleFileInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = React.useCallback((index: number) => {
    const file = files[index]
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }, [files, onFilesSelected])

  const clearAll = React.useCallback(() => {
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview)
    })
    setFiles([])
    onFilesSelected([])
    setError(null)
  }, [files, onFilesSelected])

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />
    if (file.type === "application/pdf") return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
        
        <div className={cn(
          "rounded-full p-3 mb-3",
          isDragging ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-6 w-6",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <p className="text-sm font-medium text-foreground">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Max {formatFileSize(maxSize)} per file • Up to {maxFiles} files
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{files.length} file(s) selected</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {/* Preview or icon */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    {getFileIcon(file)}
                  </div>
                )}
                
                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
