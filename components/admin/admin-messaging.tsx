"use client"

import { Label } from "@/components/ui/label"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Send, Paperclip, MoreHorizontal, Save, Download, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Value } from "@radix-ui/react-select"

interface Seller {
  id: string
  name: string
  email: string
  avatar?: string
  unreadCount: number
  lastActive: Date
  status: "active" | "inactive"
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderType: "admin" | "seller"
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

interface MessageThread {
  sellerId: string
  sellerName: string
  messages: Message[]
  lastMessage: Message
}

const sellers: Seller[] = [
  {
    id: "S-001",
    name: "John Smith",
    email: "john.smith@example.com",
    unreadCount: 2,
    lastActive: new Date(2025, 2, 28, 14, 30),
    status: "active",
  },
  {
    id: "S-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    unreadCount: 0,
    lastActive: new Date(2025, 2, 28, 12, 15),
    status: "active",
  },
  {
    id: "S-003",
    name: "Michael Brown",
    email: "mbrown@example.com",
    unreadCount: 1,
    lastActive: new Date(2025, 2, 27, 16, 45),
    status: "active",
  },
  {
    id: "S-004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    unreadCount: 0,
    lastActive: new Date(2025, 2, 26, 9, 30),
    status: "inactive",
  },
  {
    id: "S-005",
    name: "David Wilson",
    email: "dwilson@example.com",
    unreadCount: 0,
    lastActive: new Date(2025, 2, 28, 10, 20),
    status: "active",
  },
]

const messageThreads: MessageThread[] = [
  {
    sellerId: "S-001",
    sellerName: "John Smith",
    lastMessage: {
      id: "M-004",
      senderId: "S-001",
      senderName: "John Smith",
      senderType: "seller",
      recipientId: "admin",
      recipientName: "Admin",
      content: "I'll check the inventory and get back to you.",
      timestamp: new Date(2025, 2, 28, 14, 30),
      read: false,
    },
    messages: [
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
        read: false,
      },
    ],
  },
  {
    sellerId: "S-003",
    sellerName: "Michael Brown",
    lastMessage: {
      id: "M-006",
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: "S-003",
      recipientName: "Michael Brown",
      content: "Please review the new pricing policy for bulk purchases.",
      timestamp: new Date(2025, 2, 27, 16, 30),
      read: false,
    },
    messages: [
      {
        id: "M-005",
        senderId: "S-003",
        senderName: "Michael Brown",
        senderType: "seller",
        recipientId: "admin",
        recipientName: "Admin",
        content: "Hi Admin, when will the new inventory system be implemented?",
        timestamp: new Date(2025, 2, 27, 15, 45),
        read: true,
      },
      {
        id: "M-006",
        senderId: "admin",
        senderName: "Admin",
        senderType: "admin",
        recipientId: "S-003",
        recipientName: "Michael Brown",
        content: "Please review the new pricing policy for bulk purchases.",
        timestamp: new Date(2025, 2, 27, 16, 30),
        read: false,
      },
    ],
  },
]

const messageTemplates = [
  {
    id: "T-001",
    title: "Payment Reminder",
    content:
      "Dear [Seller Name],\n\nThis is a friendly reminder that your payment for invoice #[Invoice Number] is due on [Due Date]. Please ensure timely payment to avoid any late fees.\n\nThank you,\nAdmin Team",
  },
  {
    id: "T-002",
    title: "New Product Announcement",
    content:
      "Dear [Seller Name],\n\nWe're excited to announce that we've added new products to our inventory. Please check the catalog for the latest additions.\n\nBest regards,\nAdmin Team",
  },
  {
    id: "T-003",
    title: "System Maintenance",
    content:
      "Dear [Seller Name],\n\nPlease be informed that our system will be undergoing maintenance on [Date] from [Start Time] to [End Time]. During this period, the system may be unavailable.\n\nWe apologize for any inconvenience.\n\nAdmin Team",
  },
]

export function AdminMessaging() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingDuration, setTypingDuration] = useState()
  const [activeTab, setActiveTab] = useState("inbox")
  const [composeRecipient, setComposeRecipient] = useState("all")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeMessage, setComposeMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Prevent automatic redirection
  useEffect(() => {
    // Store a flag in localStorage to indicate the welcome page has been shown
    localStorage.setItem("MessagesPageShown", "true")
  }, [])

  const resetTypingDuration = () => {
    const timer = setTimeout(() => {
      setIsTyping(false)
      console.log('800')
    }, 2000)
  
    // return () => clearTimeout(timer) 
  }

  // Scroll to bottom of messages when a new message is added or when selecting a different seller
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedSellerId, messageThreads])

  // Filter sellers based on search query
  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get the selected seller's message thread
  const selectedThread = messageThreads.find((thread) => thread.sellerId === selectedSellerId)

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSellerId) return

    // Create a new message
    const newMsg = {
      id: `M-${Date.now()}`,
      senderId: "admin",
      senderName: "Admin",
      senderType: "admin",
      recipientId: selectedSellerId,
      recipientName: selectedThread?.sellerName || "Seller",
      content: newMessage,
      timestamp: new Date(),
      read: true,
    }

    // Find the thread to update
    const threadIndex = messageThreads.findIndex((thread) => thread.sellerId === selectedSellerId)

    if (threadIndex !== -1) {
      // Add the message to the thread
      messageThreads[threadIndex].messages.push(newMsg)
      // Update the last message
      messageThreads[threadIndex].lastMessage = newMsg

      // In a real app, this would send the message to the backend
      console.log("Sending message to", selectedSellerId, ":", newMessage)
    }

    // Clear the input
    setNewMessage("")

    console.log(newMessage)

    // Scroll to bottom after message is added
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleComposeMessage = () => {
    // In a real app, this would send the message to all or selected sellers
    console.log("Sending message to", composeRecipient, ":", composeMessage)
    alert("Message sent successfully!")

    // Clear the form
    setComposeSubject("")
    setComposeMessage("")
    setComposeRecipient("all")
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    const template = messageTemplates.find((t) => t.id === selectedTemplate)
    if (template) {
      setComposeSubject(template.title)
      setComposeMessage(template.content)
    }
  }

  const handleSaveTemplate = () => {
    if (!composeSubject || !composeMessage) {
      alert("Please enter a subject and message")
      return
    }

    // In a real app, this would save the template to the backend
    console.log("Saving template:", { title: composeSubject, content: composeMessage })
    alert("Template saved successfully!")
  }

  // Improved typing indication logic
  const handleTyping = (value: string) => {
    setNewMessage(value)
    if (value.length > 0) {
      setIsTyping(true)
      if (typingTimeout) clearTimeout(typingTimeout)
      const timeout = setTimeout(() => {
        // Only hide typing if input still has text
        if (newMessage.length > 0) setIsTyping(false)
      }, 3000)
      setTypingTimeout(timeout)
    } else {
      setIsTyping(false)
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="pt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Select a seller to view conversation</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search sellers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {filteredSellers.map((seller) => {
                      const thread = messageThreads.find((t) => t.sellerId === seller.id)

                      return (
                        <div
                          key={seller.id}
                          className={`flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors ${
                            selectedSellerId === seller.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedSellerId(seller.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={seller.avatar} alt={seller.name} />
                            <AvatarFallback>
                              {seller.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{seller.name}</p>
                              {thread && <p className="text-xs">{format(thread.lastMessage.timestamp, "h:mm a")}</p>}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs truncate">
                                {thread
                                  ? thread.lastMessage.content.substring(0, 30) +
                                    (thread.lastMessage.content.length > 30 ? "..." : "")
                                  : seller.email}
                              </p>
                              {seller.unreadCount > 0 && <Badge className="ml-2">{seller.unreadCount}</Badge>}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {filteredSellers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No sellers found matching your search.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              {selectedSellerId && selectedThread ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {selectedThread.sellerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{selectedThread.sellerName}</CardTitle>
                          <CardDescription>{sellers.find((s) => s.id === selectedSellerId)?.email}</CardDescription>
                        </div>
                      </div>
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
                            Delete Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {selectedThread.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.senderType === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                  <CardFooter className="border-t p-3 h-fit self-end">
                    {selectedSellerId && (
                      <div className="w-full">
                        <div
                          className={`transition-all duration-500 ${
                            isTyping && newMessage.length > 0
                              ? "opacity-100 max-h-10 mb-2"
                              : "opacity-0 max-h-0 mb-0 pointer-events-none"
                          }`}
                          aria-live="polite"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex gap-1 border pt-2 pb-1 px-[4px] rounded-md bg-secondary shadow-md">
                              <span className="animate-bounce">●</span>
                              <span className="animate-bounce delay-75">●</span>
                              <span className="animate-bounce delay-150">●</span>
                            </div>
                            <span>{selectedThread?.sellerName} is typing...</span>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2">
                          <Button variant="outline" size="icon" aria-label="Attach file">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                            aria-label="Message input"
                          />
                          <Button size="icon" onClick={handleSendMessage} aria-label="Send message">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-6">
                    <Send className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Conversation Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a seller from the list to view your conversation.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compose" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Message</CardTitle>
              <CardDescription>Create and send messages to sellers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sellers</SelectItem>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Use Template</Label>
                  <div className="flex gap-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="template" className="flex-1">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleApplyTemplate}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter message subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[200px]"
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Attach files (optional)</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSaveTemplate}>
                <Save className="mr-2 h-4 w-4" />
                Save as Template
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">Preview</Button>
                <Button onClick={handleComposeMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

