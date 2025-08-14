"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ShortcutCategory {
  name: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "H"], description: "Go to dashboard" },
      { keys: ["Ctrl", "/"], description: "Search" },
      { keys: ["Esc"], description: "Close modal or cancel" },
    ],
  },
  {
    name: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "1"], description: "Go to Sales" },
      { keys: ["Ctrl", "2"], description: "Go to Inventory" },
      { keys: ["Ctrl", "3"], description: "Go to Reports" },
      { keys: ["Ctrl", "4"], description: "Go to Customers" },
      { keys: ["Ctrl", "5"], description: "Go to Settings" },
    ],
  },
  {
    name: "Sales",
    shortcuts: [
      { keys: ["Ctrl", "B"], description: "Scan barcode" },
      { keys: ["Ctrl", "Enter"], description: "Complete sale" },
      { keys: ["Ctrl", "D"], description: "Apply discount" },
      { keys: ["Ctrl", "P"], description: "Print receipt" },
    ],
  },
  {
    name: "Inventory",
    shortcuts: [
      { keys: ["Ctrl", "A"], description: "Add new product" },
      { keys: ["Ctrl", "E"], description: "Edit selected product" },
      { keys: ["Ctrl", "Shift", "S"], description: "Update stock" },
    ],
  },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Use these keyboard shortcuts to speed up your workflow.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="inline-flex h-6 items-center justify-center rounded border bg-muted px-2 text-xs font-medium"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

