"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageSelector } from "@/components/image-gallery/image-selector"
import type { GalleryImage } from "@/contexts/image-gallery-context"
import { ImageIcon } from "lucide-react"

interface ImageSelectorButtonProps {
  onImageSelect: (image: GalleryImage) => void
  currentImageId?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ImageSelectorButton({ onImageSelect, currentImageId, variant = "outline" }: ImageSelectorButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant={variant} onClick={(e) => {
        e.preventDefault()
        setIsOpen(true)}}>
        <ImageIcon className="mr-2 h-4 w-4" />
        Select from Gallery
      </Button>

      <ImageSelector
        open={isOpen}
        onOpenChange={setIsOpen}
        onImageSelect={onImageSelect}
        currentImageId={currentImageId}
      />
    </>
  )
}
