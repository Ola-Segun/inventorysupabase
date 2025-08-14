"use client"

import { useState } from "react"
import { useImageGallery, type GalleryImage } from "@/contexts/image-gallery-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save, Trash, X, Info, Edit, ImageIcon } from "lucide-react"

interface ImageDetailsProps {
  image: GalleryImage
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageDetails({ image, open, onOpenChange }: ImageDetailsProps) {
  const { folders, updateImage, deleteImage } = useImageGallery()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(image.name)
  const [description, setDescription] = useState(image.description)
  const [selectedFolder, setSelectedFolder] = useState(image.folder)
  const [tags, setTags] = useState<string[]>([...image.tags])
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    try {
      await updateImage(image.id, {
        name,
        description,
        folder: selectedFolder,
        tags,
      })

      toast({
        title: "Image updated",
        description: "The image details have been updated.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating the image.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      try {
        await deleteImage(image.id)
        toast({
          title: "Image deleted",
          description: "The image has been removed from the gallery.",
        })
        onOpenChange(false)
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "There was a problem deleting the image.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Image" : "Image Details"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              <Info className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="preview">
              <ImageIcon className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="details" className="p-0 mt-0">
              <div className="p-6 space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Image Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter image name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter image description"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="folder">Folder</Label>
                      <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                        <SelectTrigger id="folder">
                          <SelectValue placeholder="Select a folder" />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <div key={tag} className="bg-muted px-2 py-1 rounded-md text-sm flex items-center">
                            {tag}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-1"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddTag()
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddTag}>
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleDelete}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Name:</div>
                      <div>{image.name}</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Description:</div>
                      <div>{image.description || "No description"}</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Folder:</div>
                      <div>{folders.find((f) => f.id === image.folder)?.name}</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Tags:</div>
                      <div className="flex flex-wrap gap-2">
                        {image.tags.length > 0 ? (
                          image.tags.map((tag) => (
                            <div key={tag} className="bg-muted px-2 py-1 rounded-md text-sm">
                              {tag}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">No tags</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Uploaded:</div>
                      <div>{image.uploadedAt.toLocaleDateString()}</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="font-medium text-right">Usage Count:</div>
                      <div>{image.usageCount}</div>
                    </div>

                    {image.lastUsedAt && (
                      <div className="grid grid-cols-[120px_1fr] gap-4">
                        <div className="font-medium text-right">Last Used:</div>
                        <div>{image.lastUsedAt.toLocaleDateString()}</div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="destructive" onClick={handleDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="p-0 mt-0">
              <div className="flex items-center justify-center p-6 bg-muted/30">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
