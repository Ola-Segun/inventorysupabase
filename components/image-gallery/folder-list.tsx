"use client"

import { useState } from "react"
import { useImageGallery, type GalleryFolder } from "@/contexts/image-gallery-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Folder, ImageIcon, FolderOpen, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FolderListProps {
  selectedFolder: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderList({ selectedFolder, onFolderSelect }: FolderListProps) {
  const { folders, images, updateFolder, deleteFolder } = useImageGallery()
  const { toast } = useToast()

  // Count all images
  const totalImages = images.length

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFolderForEdit, setSelectedFolderForEdit] = useState<GalleryFolder | null>(null)
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEditFolder = (folder: GalleryFolder) => {
    setSelectedFolderForEdit(folder)
    setEditedName(folder.name)
    setEditedDescription(folder.description || "")
    setIsEditDialogOpen(true)
  }

  const handleSaveFolder = async () => {
    if (!selectedFolderForEdit || !editedName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for the folder.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      await updateFolder(selectedFolderForEdit.id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      })

      setIsEditDialogOpen(false)

      toast({
        title: "Folder updated",
        description: "The folder has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was a problem updating the folder.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteFolder = async (folder: GalleryFolder) => {
    if (folder.imageCount > 0) {
      toast({
        title: "Cannot delete folder",
        description: "This folder contains images. Move or delete the images first.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      await deleteFolder(folder.id)

      // If the deleted folder was selected, clear the selection
      if (selectedFolder === folder.id) {
        onFolderSelect(null)
      }

      toast({
        title: "Folder deleted",
        description: "The folder has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the folder.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b font-medium">Folders</div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          <Button
            variant="ghost"
            className={`w-full justify-start ${!selectedFolder ? "bg-muted" : ""}`}
            onClick={() => onFolderSelect(null)}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            All Images
            <span className="ml-auto text-xs text-muted-foreground">{totalImages}</span>
          </Button>

          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center group">
              <Button
                variant="ghost"
                className={`w-full justify-start ${selectedFolder === folder.id ? "bg-muted" : ""}`}
                onClick={() => onFolderSelect(folder.id)}
              >
                {selectedFolder === folder.id ? (
                  <FolderOpen className="mr-2 h-4 w-4" />
                ) : (
                  <Folder className="mr-2 h-4 w-4" />
                )}
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{folder.imageCount}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteFolder(folder)}
                    disabled={folder.imageCount > 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>Update the folder details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folderDescription">Description (Optional)</Label>
              <Textarea
                id="folderDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter folder description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFolder} disabled={isUpdating || !editedName.trim()}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
