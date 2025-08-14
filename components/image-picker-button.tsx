"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import { ImagePicker, type SimpleImage } from "@/components/image-picker"

interface ImagePickerButtonProps {
  onImageSelect: (image: SimpleImage) => void
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ImagePickerButton({ onImageSelect, className, variant = "outline" }: ImagePickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setIsOpen(true)}>
        <ImageIcon className="h-4 w-4 mr-2" />
        Select from Gallery
      </Button>

      <ImagePicker open={isOpen} onOpenChange={setIsOpen} onImageSelect={onImageSelect} />
    </>
  )
}
