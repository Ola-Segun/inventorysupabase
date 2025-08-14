"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, Check } from "lucide-react"

// Define a simple image type that doesn't depend on the gallery context
export interface SimpleImage {
  id: string
  name: string
  url: string
  category?: string
}

interface ImagePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageSelect: (image: SimpleImage) => void
  currentImageId?: string
}

// Sample images for demonstration
const sampleImages: SimpleImage[] = [
  {
    id: "img1",
    name: "Product Image 1",
    url: "/placeholder.svg?height=200&width=200",
    category: "Products",
  },
  {
    id: "img2",
    name: "Product Image 2",
    url: "/placeholder.svg?height=200&width=200",
    category: "Products",
  },
  {
    id: "img3",
    name: "Category Image",
    url: "/placeholder.svg?height=200&width=200",
    category: "Categories",
  },
  {
    id: "img4",
    name: "User Profile",
    url: "/placeholder.svg?height=200&width=200",
    category: "Users",
  },
]

export function ImagePicker({ open, onOpenChange, onImageSelect, currentImageId }: ImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter images based on search query
  const filteredImages = sampleImages.filter(
    (img) => !searchQuery || img.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleImageSelect = (image: SimpleImage) => {
    onImageSelect(image)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search images..."
            className="w-full px-3 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 p-4">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`border rounded-md overflow-hidden cursor-pointer transition-all hover:border-primary ${
                    currentImageId === image.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    {currentImageId === image.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="truncate text-sm font-medium">{image.name}</div>
                    {image.category && <div className="text-xs text-muted-foreground">{image.category}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
