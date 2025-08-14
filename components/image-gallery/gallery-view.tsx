"use client"

import { useState } from "react"
import { useImageGallery } from "@/contexts/image-gallery-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageFilters } from "./image-filters"
import { FolderList } from "./folder-list"
import { ImageDetails } from "./image-details"
import { ImageUploader } from "./image-uploader"
import { Grid2X2, List, Plus, ImageIcon, Folder, Tag } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function GalleryView() {
  const { images, folders, selectedImages, isLoading, toggleImageSelection, clearSelectedImages } = useImageGallery()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [detailsImageId, setDetailsImageId] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Get all unique tags from images
  const allTags = Array.from(new Set(images.flatMap((img) => img.tags))).sort()

  // Filter images based on current folder, search query, and selected tags
  const filteredImages = images
    .filter((img) => !currentFolder || img.folder === currentFolder)
    .filter(
      (img) =>
        !searchQuery ||
        img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .filter((img) => selectedTags.length === 0 || selectedTags.some((tag) => img.tags.includes(tag)))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const selectedImage = detailsImageId ? images.find((img) => img.id === detailsImageId) : null

  return (
    <div className="space-y-4">
      {/* Top actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsUploadOpen(true)} variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Upload Images
          </Button>

          {selectedImages.length > 0 && (
            <Button variant="outline" onClick={clearSelectedImages}>
              Clear Selection ({selectedImages.length})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="border rounded-md overflow-hidden">
        <div className="p-4 border-b">
          <ImageFilters onSearch={setSearchQuery} searchQuery={searchQuery} />
        </div>

        <div className="flex">
          {/* Folders sidebar */}
          <div className="hidden md:block w-64 border-r">
            <Tabs defaultValue="folders">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="folders">
                  <Folder className="mr-2 h-4 w-4" />
                  Folders
                </TabsTrigger>
                <TabsTrigger value="tags">
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                </TabsTrigger>
              </TabsList>

              <TabsContent value="folders" className="p-0 mt-0">
                <FolderList folders={folders} currentFolder={currentFolder} onFolderSelect={setCurrentFolder} />
              </TabsContent>

              <TabsContent value="tags" className="p-0 mt-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4 space-y-2">
                    {allTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags found</p>
                    ) : (
                      allTags.map((tag) => (
                        <div
                          key={tag}
                          className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                            selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                            )
                          }}
                        >
                          {tag}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Images grid/list */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No images found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || selectedTags.length > 0
                      ? "Try adjusting your search or filters"
                      : currentFolder
                        ? "This folder is empty"
                        : "Upload some images to get started"}
                  </p>
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload New Image
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`border rounded-md overflow-hidden cursor-pointer transition-all hover:border-primary ${
                        selectedImages.includes(image.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setDetailsImageId(image.id)}
                      onDoubleClick={() => toggleImageSelection(image.id)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedImages.includes(image.id) && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="truncate text-sm font-medium">{image.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs text-muted-foreground">
                            {folders.find((f) => f.id === image.folder)?.name}
                          </div>
                          {image.usageCount > 0 && (
                            <div className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">Used: {image.usageCount}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`flex items-center p-4 cursor-pointer hover:bg-muted/50 ${
                        selectedImages.includes(image.id) ? "bg-muted" : ""
                      }`}
                      onClick={() => setDetailsImageId(image.id)}
                      onDoubleClick={() => toggleImageSelection(image.id)}
                    >
                      <div className="w-16 h-16 mr-4 flex-shrink-0">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{image.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{image.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                            {folders.find((f) => f.id === image.folder)?.name}
                          </div>
                          {image.tags.slice(0, 3).map((tag) => (
                            <div key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                              {tag}
                            </div>
                          ))}
                          {image.tags.length > 3 && (
                            <div className="text-xs text-muted-foreground">+{image.tags.length - 3} more</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 text-sm text-muted-foreground">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </div>
                      {image.usageCount > 0 && (
                        <div className="ml-4 flex-shrink-0 text-sm">Used: {image.usageCount}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Image details modal */}
      {selectedImage && (
        <ImageDetails
          image={selectedImage}
          open={!!detailsImageId}
          onOpenChange={(open) => {
            if (!open) setDetailsImageId(null)
          }}
        />
      )}

      {/* Upload modal */}
      <ImageUploader open={isUploadOpen} onOpenChange={setIsUploadOpen} currentFolder={currentFolder} />
    </div>
  )
}
