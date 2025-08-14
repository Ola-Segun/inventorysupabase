"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Paperclip, MoreHorizontal, Download, Trash2, Bell } from "lucide-react"
import { format } from "date-fns"

// --- New: User List ---
interface User {
  id: string
  name: string
  role: "admin" | "manager" | "cashier" | "seller"
  avatarUrl?: string
}

const users: User[] = [
  { id: "admin", name: "Admin", role: "admin" },
  { id: "S-001", name: "John Smith", role: "seller" },
  { id: "S-002", name: "Jane Doe", role: "seller" },
  { id: "M-001", name: "Mary Manager", role: "manager" },
  { id: "C-001", name: "Carl Cashier", role: "cashier" },
]

// --- New: Per-user chat state ---
interface Message {
  id: string
  senderId: string
  senderName: string
  senderType: "admin" | "seller" | "manager" | "cashier"
  recipientId: string
  recipientName: string
  content: string
  timestamp: Date
  read: boolean
  attachment?: {
    name: string
    size: string
    type: string
  }
}

// Demo: initial messages per user
const initialChats: Record<string, Message[]> = {
  admin: [
    {
      id: "M-001",
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: "S-001",
      recipientName: "John Smith",
      content: "Hello John, I noticed some discrepancies in the latest inventory report. Could you please review it?",
      timestamp: new Date(2025, 2, 28, 10, 15),
      read: true,
    },
    {
      id: "M-002",
      senderId: "S-001",
      senderName: "John Smith",
      senderType: "seller",
      recipientId: "admin",
      recipientName: "Admin",
      content: "Good morning! I'll take a look at it right away.",
      timestamp: new Date(2025, 2, 28, 10, 30),
      read: true,
    },
    {
      id: "M-003",
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: "S-001",
      recipientName: "John Smith",
      content: "Thank you. Please let me know if you find any issues.",
      timestamp: new Date(2025, 2, 28, 10, 45),
      read: true,
      attachment: {
        name: "inventory_report_march.pdf",
        size: "2.4 MB",
        type: "pdf",
      },
    },
    {
      id: "M-004",
      senderId: "S-001",
      senderName: "John Smith",
      senderType: "seller",
      recipientId: "admin",
      recipientName: "Admin",
      content: "I'll check the inventory and get back to you.",
      timestamp: new Date(2025, 2, 28, 14, 30),
      read: true,
    },
    {
      id: "M-005",
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: "S-001",
      recipientName: "John Smith",
      content:
        "We're planning to update the inventory system next week. Please make sure all your current inventory is properly recorded before the update.",
      timestamp: new Date(2025, 2, 28, 16, 0),
      read: false,
    },
  ],
  "S-002": [
    {
      id: "M-006",
      senderId: "S-002",
      senderName: "Jane Doe",
      senderType: "seller",
      recipientId: "admin",
      recipientName: "Admin",
      content: "Hi Admin, can I get the updated price list?",
      timestamp: new Date(2025, 2, 28, 11, 0),
      read: true,
    },
    {
      id: "M-007",
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: "S-002",
      recipientName: "Jane Doe",
      content: "Sure Jane, I'll send it to you shortly.",
      timestamp: new Date(2025, 2, 28, 11, 5),
      read: true,
    },
  ],
  "M-001": [],
  "C-001": [],
}

export function SellerMessaging() {
  // --- New: Chat state per user ---
  const [selectedUserId, setSelectedUserId] = useState<string>("admin")
  const [chats, setChats] = useState<Record<string, Message[]>>(() => ({ ...initialChats }))
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Unread count for selected user
  const unreadCount =
    chats[selectedUserId]?.filter((m) => !m.read && m.senderId !== "S-001").length || 0

  // Scroll to bottom of messages when selected user or chat changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedUserId, chats])

  // Send message to selected user
  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const recipient = users.find((u) => u.id === selectedUserId)
    if (!recipient) return

    const newMsg: Message = {
      id: `M-${Date.now()}`,
      senderId: "S-001", // This seller's ID (hardcoded for demo)
      senderName: "John Smith",
      senderType: "seller",
      recipientId: recipient.id,
      recipientName: recipient.name,
      content: newMessage,
      timestamp: new Date(),
      read: true,
    }

    setChats((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), newMsg],
    }))
    setNewMessage("")
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleMarkAllAsRead = () => {
    setChats((prev) => ({
      ...prev,
      [selectedUserId]: prev[selectedUserId]?.map((m) => ({ ...m, read: true })) || [],
    }))
  }

  // --- New: User List Sidebar ---
  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* User List */}
      <Card className="w-64 flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">Users</div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {users.map((user) => (
              <button
                key={user.id}
                className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition ${
                  selectedUserId === user.id ? "bg-accent font-bold" : ""
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || "/placeholder.svg?height=32&width=32"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                </div>
                {chats[user.id]?.some((m) => !m.read && m.senderId !== "S-001") && (
                  <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 text-xs">
                    {chats[user.id].filter((m) => !m.read && m.senderId !== "S-001").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col h-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    users.find((u) => u.id === selectedUserId)?.avatarUrl ||
                    "/placeholder.svg?height=40&width=40"
                  }
                  alt={users.find((u) => u.id === selectedUserId)?.name || ""}
                />
                <AvatarFallback>
                  {users
                    .find((u) => u.id === selectedUserId)
                    ?.name.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{users.find((u) => u.id === selectedUserId)?.name}</CardTitle>
                <CardDescription className="capitalize">
                  {users.find((u) => u.id === selectedUserId)?.role}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <Bell className="mr-2 h-4 w-4" />
                  Mark All as Read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Conversation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)] p-4">
            <div className="space-y-4 mb-10">
              {(chats[selectedUserId] || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === "S-001" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.senderId === "S-001"
                        ? "bg-primary text-primary-foreground"
                        : message.read
                        ? "bg-muted"
                        : "bg-blue-100 dark:bg-blue-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-xs font-medium">{message.senderName}</p>
                      <p className="text-xs">{format(message.timestamp, "h:mm a")}</p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachment && (
                      <div className="mt-2 flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="flex-1 truncate">{message.attachment.name}</span>
                        <span className="text-muted-foreground">{message.attachment.size}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-3">
          <div className="flex w-full items-center gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

