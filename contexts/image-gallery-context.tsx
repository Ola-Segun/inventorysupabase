"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

export interface GalleryImage {
  id: string
  url: string
  name: string
  description: string
  tags: string[]
  folder: string
  size?: number
  dimensions?: { width: number; height: number }
  uploadedAt: Date
  lastUsedAt?: Date
  usageCount: number
}

export interface GalleryFolder {
  id: string
  name: string
  description?: string
  imageCount: number
}

interface ImageGalleryContextType {
  images: GalleryImage[]
  folders: GalleryFolder[]
  selectedImages: string[]
  isLoading: boolean
  addImage: (image: Omit<GalleryImage, "id" | "uploadedAt" | "usageCount">) => Promise<GalleryImage>
  updateImage: (id: string, updates: Partial<GalleryImage>) => Promise<GalleryImage>
  deleteImage: (id: string) => Promise<void>
  deleteMultipleImages: (ids: string[]) => Promise<void>
  addFolder: (name: string, description?: string) => Promise<GalleryFolder>
  updateFolder: (id: string, updates: Partial<GalleryFolder>) => Promise<GalleryFolder>
  deleteFolder: (id: string) => Promise<void>
  selectImage: (id: string) => void
  deselectImage: (id: string) => void
  toggleImageSelection: (id: string) => void
  clearSelectedImages: () => void
  selectAllImages: () => void
  getImageById: (id: string) => GalleryImage | undefined
  recordImageUsage: (id: string) => void
  searchImages: (query: string) => GalleryImage[]
  filterImagesByFolder: (folderId: string | null) => GalleryImage[]
  filterImagesByTags: (tags: string[]) => GalleryImage[]
}

const defaultFolders: GalleryFolder[] = [
  { id: "folder-1", name: "Products", description: "Product images", imageCount: 0 },
  { id: "folder-2", name: "Categories", description: "Category images", imageCount: 0 },
  { id: "folder-3", name: "Customers", description: "Customer profile images", imageCount: 0 },
  { id: "folder-4", name: "Marketing", description: "Marketing and promotional images", imageCount: 0 },
  { id: "folder-5", name: "Misc", description: "Miscellaneous images", imageCount: 0 },
]

// Sample placeholder images
const defaultImages: GalleryImage[] = [
  {
    id: "img-1",
    url: "/placeholder.svg?height=400&width=400",
    name: "Sample Product 1",
    description: "A sample product image",
    tags: ["product", "sample"],
    folder: "folder-1",
    uploadedAt: new Date(2025, 2, 15),
    usageCount: 2,
  },
  {
    id: "img-2",
    url: "/placeholder.svg?height=400&width=400",
    name: "Sample Category",
    description: "A sample category image",
    tags: ["category", "sample"],
    folder: "folder-2",
    uploadedAt: new Date(2025, 2, 16),
    usageCount: 1,
  },
  {
    id: "img-3",
    url: "/placeholder.svg?height=400&width=400",
    name: "Customer Profile",
    description: "A sample customer profile image",
    tags: ["customer", "profile"],
    folder: "folder-3",
    uploadedAt: new Date(2025, 2, 17),
    usageCount: 0,
  },
  {
    id: "img-4",
    url: "/placeholder.svg?height=400&width=400",
    name: "Promotional Banner",
    description: "A sample promotional banner",
    tags: ["marketing", "banner"],
    folder: "folder-4",
    uploadedAt: new Date(2025, 2, 18),
    usageCount: 0,
  },
  {
    id: "img-5",
    url: "/placeholder.svg?height=400&width=400",
    name: "Miscellaneous Image",
    description: "A sample miscellaneous image",
    tags: ["misc"],
    folder: "folder-5",
    uploadedAt: new Date(2025, 2, 19),
    usageCount: 0,
  },
]

// Update folder image counts
defaultFolders.forEach((folder) => {
  folder.imageCount = defaultImages.filter((img) => img.folder === folder.id).length
})

const ImageGalleryContext = createContext<ImageGalleryContextType | undefined>(undefined)

export function ImageGalleryProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [folders, setFolders] = useState<GalleryFolder[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load data from localStorage on mount
  useEffect(() => {
    const loadGalleryData = () => {
      try {
        const storedImages = localStorage.getItem("gallery-images")
        const storedFolders = localStorage.getItem("gallery-folders")

        if (storedImages) {
          const parsedImages = JSON.parse(storedImages)
          // Convert string dates back to Date objects
          setImages(
            parsedImages.map((img: any) => ({
              ...img,
              uploadedAt: new Date(img.uploadedAt),
              lastUsedAt: img.lastUsedAt ? new Date(img.lastUsedAt) : undefined,
            })),
          )
        } else {
          setImages(defaultImages)
        }

        if (storedFolders) {
          setFolders(JSON.parse(storedFolders))
        } else {
          setFolders(defaultFolders)
        }
      } catch (error) {
        console.error("Error loading gallery data:", error)
        toast({
          title: "Error loading gallery",
          description: "There was a problem loading your image gallery.",
          variant: "destructive",
        })
        // Fall back to defaults
        setImages(defaultImages)
        setFolders(defaultFolders)
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryData()
  }, [toast])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("gallery-images", JSON.stringify(images))
        localStorage.setItem("gallery-folders", JSON.stringify(folders))
      } catch (error) {
        console.error("Error saving gallery data:", error)
        toast({
          title: "Error saving gallery",
          description: "There was a problem saving your image gallery.",
          variant: "destructive",
        })
      }
    }
  }, [images, folders, isLoading, toast])

  const addImage = async (image: Omit<GalleryImage, "id" | "uploadedAt" | "usageCount">) => {
    const newImage: GalleryImage = {
      ...image,
      id: `img-${Date.now()}`,
      uploadedAt: new Date(),
      usageCount: 0,
    }

    setImages((prev) => [...prev, newImage])

    // Update folder image count
    setFolders((prev) =>
      prev.map((folder) => (folder.id === image.folder ? { ...folder, imageCount: folder.imageCount + 1 } : folder)),
    )

    return newImage
  }

  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    const oldImage = images.find((img) => img.id === id)
    if (!oldImage) {
      throw new Error(`Image with ID ${id} not found`)
    }

    const updatedImage = { ...oldImage, ...updates }

    setImages((prev) => prev.map((img) => (img.id === id ? updatedImage : img)))

    // If folder changed, update folder image counts
    if (updates.folder && updates.folder !== oldImage.folder) {
      setFolders((prev) =>
        prev.map((folder) => {
          if (folder.id === oldImage.folder) {
            return { ...folder, imageCount: folder.imageCount - 1 }
          }
          if (folder.id === updates.folder) {
            return { ...folder, imageCount: folder.imageCount + 1 }
          }
          return folder
        }),
      )
    }

    return updatedImage
  }

  const deleteImage = async (id: string) => {
    const imageToDelete = images.find((img) => img.id === id)
    if (!imageToDelete) return

    setImages((prev) => prev.filter((img) => img.id !== id))
    setSelectedImages((prev) => prev.filter((imgId) => imgId !== id))

    // Update folder image count
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === imageToDelete.folder ? { ...folder, imageCount: folder.imageCount - 1 } : folder,
      ),
    )
  }

  const deleteMultipleImages = async (ids: string[]) => {
    // Get the images to delete
    const imagesToDelete = images.filter((img) => ids.includes(img.id))

    // Remove the images
    setImages((prev) => prev.filter((img) => !ids.includes(img.id)))
    setSelectedImages((prev) => prev.filter((imgId) => !ids.includes(imgId)))

    // Update folder image counts
    const folderCounts: Record<string, number> = {}
    imagesToDelete.forEach((img) => {
      folderCounts[img.folder] = (folderCounts[img.folder] || 0) + 1
    })

    setFolders((prev) =>
      prev.map((folder) => {
        if (folderCounts[folder.id]) {
          return { ...folder, imageCount: folder.imageCount - folderCounts[folder.id] }
        }
        return folder
      }),
    )
  }

  const addFolder = async (name: string, description?: string) => {
    const newFolder: GalleryFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      imageCount: 0,
    }

    setFolders((prev) => [...prev, newFolder])
    return newFolder
  }

  const updateFolder = async (id: string, updates: Partial<GalleryFolder>) => {
    const updatedFolder = { ...folders.find((f) => f.id === id)!, ...updates }
    setFolders((prev) => prev.map((folder) => (folder.id === id ? updatedFolder : folder)))
    return updatedFolder
  }

  const deleteFolder = async (id: string) => {
    // Check if folder has images
    const folderHasImages = images.some((img) => img.folder === id)

    if (folderHasImages) {
      throw new Error("Cannot delete folder that contains images")
    }

    setFolders((prev) => prev.filter((folder) => folder.id !== id))
  }

  const selectImage = (id: string) => {
    if (!selectedImages.includes(id)) {
      setSelectedImages((prev) => [...prev, id])
    }
  }

  const deselectImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((imgId) => imgId !== id))
  }

  const toggleImageSelection = (id: string) => {
    if (selectedImages.includes(id)) {
      deselectImage(id)
    } else {
      selectImage(id)
    }
  }

  const clearSelectedImages = () => {
    setSelectedImages([])
  }

  const selectAllImages = () => {
    setSelectedImages(images.map((img) => img.id))
  }

  const getImageById = (id: string) => {
    return images.find((img) => img.id === id)
  }

  const recordImageUsage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, usageCount: img.usageCount + 1, lastUsedAt: new Date() } : img)),
    )
  }

  const searchImages = (query: string) => {
    if (!query) return images

    const lowerQuery = query.toLowerCase()
    return images.filter(
      (img) =>
        img.name.toLowerCase().includes(lowerQuery) ||
        img.description.toLowerCase().includes(lowerQuery) ||
        img.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  const filterImagesByFolder = (folderId: string | null) => {
    if (!folderId) return images
    return images.filter((img) => img.folder === folderId)
  }

  const filterImagesByTags = (tags: string[]) => {
    if (!tags.length) return images
    return images.filter((img) => tags.some((tag) => img.tags.includes(tag)))
  }

  return (
    <ImageGalleryContext.Provider
      value={{
        images,
        folders,
        selectedImages,
        isLoading,
        addImage,
        updateImage,
        deleteImage,
        deleteMultipleImages,
        addFolder,
        updateFolder,
        deleteFolder,
        selectImage,
        deselectImage,
        toggleImageSelection,
        clearSelectedImages,
        selectAllImages,
        getImageById,
        recordImageUsage,
        searchImages,
        filterImagesByFolder,
        filterImagesByTags,
      }}
    >
      {children}
    </ImageGalleryContext.Provider>
  )
}

export const useImageGallery = () => {
  const context = useContext(ImageGalleryContext)
  if (context === undefined) {
    throw new Error("useImageGallery must be used within an ImageGalleryProvider")
  }
  return context
}
