"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Trash2,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ShieldAlert,
  FileText,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ImageUpload } from "@/components/image-upload"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "manager" | "cashier" | "regular"
  lastActive: Date
  status: "active" | "inactive"
  profileImage?: string
}

interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: Date
  details: string
}

const users: User[] = [
  {
    id: "S-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    role: "manager",
    lastActive: new Date(2025, 2, 28, 14, 30),
    status: "active",
    profileImage:
      "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2256%22%20height%3D%2256%22%20viewBox%3D%220%200%2056%2056%22%3E%3Cpath%20fill%3D%22%23007BFF%22%20d%3D%22M28%2046.1C14.8%2046.1%204.3%2035.6%204.3%2022.4S14.8-1.3%2028-1.3%2051.7%209.2%2051.7%2022.4%2041.2%2046.1%2028%2046.1zm0-42.9C16.2%203.2%206.8%2012.6%206.8%2024.4S16.2%2045.6%2028%2045.6s21.2-9.4%2021.2-21.2S39.8%203.2%2028%203.2z%22%2F%3E%3Cpath%20fill%3D%22%23007BFF%22%20d%3D%22M28%2036.8c-6.9%200-12.5-5.6-12.5-12.5S21.1%2011.8%2028%2011.8s12.5%205.6%2012.5%2012.5S34.9%2036.8%2028%2036.8zm0-23.5c-6.1%200-11%204.9-11%2011s4.9%2011%2011%2011%2011-4.9%2011-11-4.9-11-11-11z%22%2F%3E%3C%2Fsvg%3E",
  },
  {
    id: "S-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 234-5678",
    role: "cashier",
    lastActive: new Date(2025, 2, 28, 12, 15),
    status: "active",
    profileImage:
      "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2256%22%20height%3D%2256%22%20viewBox%3D%220%200%2056%2056%22%3E%3Cpath%20fill%3D%22%23E91E63%22%20d%3D%22M28%2046.1C14.8%2046.1%204.3%2035.6%204.3%2022.4S14.8-1.3%2028-1.3%2051.7%209.2%2051.7%2022.4%2041.2%2046.1%2028%2046.1zm0-42.9C16.2%203.2%206.8%2012.6%206.8%2024.4S16.2%2045.6%2028%2045.6s21.2-9.4%2021.2-21.2S39.8%203.2%2028%203.2z%22%2F%3E%3Cpath%20fill%3D%22%23E91E63%22%20d%3D%22M28%2036.8c-6.9%200-12.5-5.6-12.5-12.5S21.1%2011.8%2028%2011.8s12.5%205.6%2012.5%2012.5S34.9%2036.8%2028%2036.8zm0-23.5c-6.1%200-11%204.9-11%2011s4.9%2011%2011%2011%2011-4.9%2011-11-4.9-11-11-11z%22%2F%3E%3C%2Fsvg%3E",
  },
  {
    id: "S-003",
    name: "Michael Brown",
    email: "mbrown@example.com",
    phone: "(555) 345-6789",
    role: "regular",
    lastActive: new Date(2025, 2, 27, 16, 45),
    status: "active",
  },
  {
    id: "S-004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "(555) 456-7890",
    role: "regular",
    lastActive: new Date(2025, 2, 26, 9, 30),
    status: "inactive",
  },
  {
    id: "S-005",
    name: "David Wilson",
    email: "dwilson@example.com",
    phone: "(555) 567-8901",
    role: "cashier",
    lastActive: new Date(2025, 2, 28, 10, 20),
    status: "active",
  },
  {
    id: "S-006",
    name: "Jennifer Taylor",
    email: "jtaylor@example.com",
    phone: "(555) 678-9012",
    role: "regular",
    lastActive: new Date(2025, 2, 25, 14, 10),
    status: "active",
  },
  {
    id: "S-007",
    name: "Robert Anderson",
    email: "randerson@example.com",
    phone: "(555) 789-0123",
    role: "manager",
    lastActive: new Date(2025, 2, 28, 11, 45),
    status: "active",
  },
  {
    id: "S-008",
    name: "Lisa Thomas",
    email: "lisa.t@example.com",
    phone: "(555) 890-1234",
    role: "regular",
    lastActive: new Date(2025, 2, 24, 15, 30),
    status: "inactive",
  },
]

const activityLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    userId: "S-001",
    userName: "John Smith",
    action: "Completed Sale",
    timestamp: new Date(2025, 2, 28, 14, 30),
    details: "Processed order #ORD-2023-042 for $245.75",
  },
  {
    id: "LOG-002",
    userId: "S-002",
    userName: "Sarah Johnson",
    action: "Generated Invoice",
    timestamp: new Date(2025, 2, 28, 12, 15),
    details: "Created invoice #INV-2023-089 for $780.50",
  },
  {
    id: "LOG-003",
    userId: "S-005",
    userName: "David Wilson",
    action: "Updated Inventory",
    timestamp: new Date(2025, 2, 28, 10, 20),
    details: "Added 50 units of Organic Apples (Case)",
  },
  {
    id: "LOG-004",
    userId: "S-007",
    userName: "Robert Anderson",
    action: "Login",
    timestamp: new Date(2025, 2, 28, 11, 45),
    details: "Logged in from IP 192.168.1.105",
  },
  {
    id: "LOG-005",
    userId: "S-001",
    userName: "John Smith",
    action: "Updated Profile",
    timestamp: new Date(2025, 2, 28, 13, 10),
    details: "Changed contact information",
  },
  {
    id: "LOG-006",
    userId: "S-003",
    userName: "Michael Brown",
    action: "Failed Login Attempt",
    timestamp: new Date(2025, 2, 27, 16, 45),
    details: "3 failed login attempts from IP 192.168.1.110",
  },
  {
    id: "LOG-007",
    userId: "S-002",
    userName: "Sarah Johnson",
    action: "Viewed Reports",
    timestamp: new Date(2025, 2, 28, 11, 30),
    details: "Accessed sales reports for March 2025",
  },
]

const activeUsers = [
  {
    id: "S-001",
    name: "John Smith",
    status: "active",
    currentAction: "Processing order #ORD-2023-043",
    since: new Date(2025, 2, 28, 14, 15),
  },
  {
    id: "S-002",
    name: "Sarah Johnson",
    status: "idle",
    currentAction: "Viewing inventory",
    since: new Date(2025, 2, 28, 12, 0),
  },
  {
    id: "S-005",
    name: "David Wilson",
    status: "active",
    currentAction: "Generating invoice",
    since: new Date(2025, 2, 28, 10, 0),
  },
  {
    id: "S-007",
    name: "Robert Anderson",
    status: "active",
    currentAction: "Viewing reports",
    since: new Date(2025, 2, 28, 11, 30),
  },
]

export function AdminUserManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "regular",
    password: "",
    confirmPassword: "",
  })
  const [newUserImage, setNewUserImage] = useState<string | null>(null)
  const [formData, setFormData] = useState<User | null>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "regular",
    lastActive: new Date(),
    status: "active",
    profileImage: undefined,
  })

  // Prevent automatic redirection
  useEffect(() => {
    // Store a flag in localStorage to indicate the welcome page has been shown
    localStorage.setItem("UserManagementPageShown", "true")
  }, [])

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    // Filter by search query
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by status
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    // Filter by role
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map((user) => user.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId])
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
    }
  }

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      alert("Please fill in all required fields")
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    // In a real app, this would add the user to the database
    console.log("Adding user:", { ...newUser, profileImage: newUserImage })
    alert("User added successfully!")

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "regular",
      password: "",
      confirmPassword: "",
    })
    setNewUserImage(null)
    setIsAddUserOpen(false)
  }

  const handleEditUser = () => {
    // In a real app, this would update the user in the database
    console.log("Editing user:", selectedUser)
    alert("User updated successfully!")

    // Close dialog
    setIsEditUserOpen(false)
  }

  const handleDeactivateUser = () => {
    // In a real app, this would deactivate the user in the database
    console.log("Deactivating user:", selectedUser)
    alert("User deactivated successfully!")

    // Close dialog
    setIsDeactivateConfirmOpen(false)
  }

  const handleDeleteUser = () => {
    // In a real app, this would delete the user from the database
    console.log("Deleting user:", selectedUser)
    alert("User deleted successfully!")

    // Close dialog
    setIsDeleteConfirmOpen(false)
  }

  const handleBulkDeactivate = () => {
    if (!selectedUserIds.length) return

    if (confirm(`Are you sure you want to deactivate ${selectedUserIds.length} users?`)) {
      // In a real app, this would deactivate multiple users in the database
      console.log("Deactivating users:", selectedUserIds)

      // Provide feedback
      alert(`${selectedUserIds.length} users deactivated successfully!`)

      // Clear selection
      setSelectedUserIds([])
    }
  }

  const handleBulkDelete = () => {
    if (!selectedUserIds.length) return

    if (confirm(`Are you sure you want to delete ${selectedUserIds.length} users? This action cannot be undone.`)) {
      // In a real app, this would delete multiple users from the database
      console.log("Deleting users:", selectedUserIds)

      // Provide feedback
      alert(`${selectedUserIds.length} users deleted successfully!`)

      // Clear selection
      setSelectedUserIds([])
    }
  }

  const handleExportUsers = () => {
    // In a real app, this would export user data to CSV/PDF
    console.log("Exporting users:", filteredUsers)
    alert("User data exported successfully!")
  }

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500">Admin</Badge>
      case "manager":
        return <Badge className="bg-blue-500">Manager</Badge>
      case "cashier":
        return <Badge className="bg-green-500">Cashier</Badge>
      case "regular":
        return <Badge variant="outline">Regular</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "Completed Sale":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Generated Invoice":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "Updated Inventory":
        return <Edit className="h-4 w-4 text-amber-500" />
      case "Login":
        return <User className="h-4 w-4 text-green-500" />
      case "Updated Profile":
        return <User className="h-4 w-4 text-blue-500" />
      case "Failed Login Attempt":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "Viewed Reports":
        return <Eye className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <div className="h-3 w-3 rounded-full bg-green-500" />
      case "idle":
        return <div className="h-3 w-3 rounded-full bg-amber-500" />
      case "offline":
        return <div className="h-3 w-3 rounded-full bg-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <User className="mr-2 h-4 w-4" />
            User Accounts
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="mr-2 h-4 w-4" />
            Activity Monitoring
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>Manage user accounts and their information</CardDescription>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>

                  {/* Edit Product Dialog */}
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Enter the user details to create a new account.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 grid-cols-2">
                      <div className="grid gap-4">
                          <ImageUpload
                            initialImage={newUserImage || undefined}
                            onImageChange={(imageData) => setNewUserImage(imageData)}
                            aspectRatio={1}
                            entityName="user profile"
                            enableGallerySelection={true}
                          />
                      </div>

                      <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                              >
                                <SelectTrigger id="role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="cashier">Cashier</SelectItem>
                                  <SelectItem value="regular">Regular</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={newUser.phone}
                              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                          </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={newUser.confirmPassword}
                              onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {selectedUserIds.length > 0 && (
                <div className="bg-muted p-2 rounded-md mb-4 flex items-center justify-between">
                  <span className="text-sm">{selectedUserIds.length} users selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                      Deactivate Selected
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                          onCheckedChange={handleSelectAllUsers}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUserIds.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {user.profileImage ? (
                                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                              ) : (
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{formatDistanceToNow(user.lastActive, { addSuffix: true })}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsEditUserOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDeactivateConfirmOpen(true)
                                }}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsDeleteConfirmOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No users found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportUsers}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Edit User Dialog */}
          {selectedUser && (
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user information and role.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 grid-cols-2">
                  <div className="flex justify-center mb-2">
                      <ImageUpload
                        initialImage={selectedUser.profileImage}
                        onImageChange={(imageData) => {
                          if (selectedUser) {
                            setSelectedUser({ ...selectedUser, profileImage: imageData || undefined })
                          }
                        }}
                        aspectRatio={1}
                        entityName="user profile"
                        enableGallerySelection={true}
                      />
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input id="edit-name" defaultValue={selectedUser.name} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select defaultValue={selectedUser.role}>
                          <SelectTrigger id="edit-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email Address</Label>
                        <Input id="edit-email" type="email" defaultValue={selectedUser.email} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <Input id="edit-phone" defaultValue={selectedUser.phone} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select defaultValue={selectedUser.status}>
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditUser}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Deactivate Confirmation Dialog */}
          {selectedUser && (
            <Dialog open={isDeactivateConfirmOpen} onOpenChange={setIsDeactivateConfirmOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{selectedUser.status === "active" ? "Deactivate" : "Activate"} User</DialogTitle>
                  <DialogDescription>
                    {selectedUser.status === "active"
                      ? "This will prevent the user from accessing the system."
                      : "This will restore the user's access to the system."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Are you sure you want to {selectedUser.status === "active" ? "deactivate" : "activate"} the
                    account for <span className="font-medium">{selectedUser.name}</span>?
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeactivateConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant={selectedUser.status === "active" ? "destructive" : "default"}
                    onClick={handleDeactivateUser}
                  >
                    {selectedUser.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Confirmation Dialog */}
          {selectedUser && (
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The user account will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-destructive">
                    Are you sure you want to delete the account for{" "}
                    <span className="font-medium">{selectedUser.name}</span>?
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteUser}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Users currently logged into the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {activeUsers.map((user) => (
                      <div key={user.id} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex items-center justify-center">{getStatusIcon(user.status)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(user.since, { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">{user.currentAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Recent actions performed by users</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          {getActivityIcon(log.action)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity Logs
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage role-based permissions for users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Admin Role */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Admin</h3>
                      <p className="text-sm text-muted-foreground">Full access to all system features</p>
                    </div>
                    <Badge className="bg-purple-500">Highest Access</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sales & Orders</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-sales-view" defaultChecked disabled />
                        <Label htmlFor="admin-sales-view">View Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-sales-create" defaultChecked disabled />
                        <Label htmlFor="admin-sales-create">Create Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-sales-void" defaultChecked disabled />
                        <Label htmlFor="admin-sales-void">Void Sales</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Inventory</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-inventory-view" defaultChecked disabled />
                        <Label htmlFor="admin-inventory-view">View Inventory</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-inventory-manage" defaultChecked disabled />
                        <Label htmlFor="admin-inventory-manage">Manage Inventory</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Reports</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-reports-view" defaultChecked disabled />
                        <Label htmlFor="admin-reports-view">View Reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-reports-export" defaultChecked disabled />
                        <Label htmlFor="admin-reports-export">Export Reports</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">User Management</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-users-view" defaultChecked disabled />
                        <Label htmlFor="admin-users-view">View Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-users-manage" defaultChecked disabled />
                        <Label htmlFor="admin-users-manage">Manage Users</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Settings</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-settings-view" defaultChecked disabled />
                        <Label htmlFor="admin-settings-view">View Settings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-settings-manage" defaultChecked disabled />
                        <Label htmlFor="admin-settings-manage">Manage Settings</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Role */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Manager</h3>
                      <p className="text-sm text-muted-foreground">Access to most system features</p>
                    </div>
                    <Badge className="bg-blue-500">High Access</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sales & Orders</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-sales-view" defaultChecked />
                        <Label htmlFor="manager-sales-view">View Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-sales-create" defaultChecked />
                        <Label htmlFor="manager-sales-create">Create Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-sales-void" defaultChecked />
                        <Label htmlFor="manager-sales-void">Void Sales</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Inventory</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-inventory-view" defaultChecked />
                        <Label htmlFor="manager-inventory-view">View Inventory</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-inventory-manage" defaultChecked />
                        <Label htmlFor="manager-inventory-manage">Manage Inventory</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Reports</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-reports-view" defaultChecked />
                        <Label htmlFor="manager-reports-view">View Reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-reports-export" defaultChecked />
                        <Label htmlFor="manager-reports-export">Export Reports</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">User Management</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-users-view" defaultChecked />
                        <Label htmlFor="manager-users-view">View Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-users-manage" />
                        <Label htmlFor="manager-users-manage">Manage Users</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Settings</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-settings-view" defaultChecked />
                        <Label htmlFor="manager-settings-view">View Settings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="manager-settings-manage" />
                        <Label htmlFor="manager-settings-manage">Manage Settings</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cashier Role */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Cashier</h3>
                      <p className="text-sm text-muted-foreground">Limited access focused on sales</p>
                    </div>
                    <Badge className="bg-green-500">Medium Access</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sales & Orders</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-sales-view" defaultChecked />
                        <Label htmlFor="cashier-sales-view">View Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-sales-create" defaultChecked />
                        <Label htmlFor="cashier-sales-create">Create Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-sales-void" />
                        <Label htmlFor="cashier-sales-void">Void Sales</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Inventory</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-inventory-view" defaultChecked />
                        <Label htmlFor="cashier-inventory-view">View Inventory</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-inventory-manage" />
                        <Label htmlFor="cashier-inventory-manage">Manage Inventory</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Reports</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-reports-view" />
                        <Label htmlFor="cashier-reports-view">View Reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cashier-reports-export" />
                        <Label htmlFor="cashier-reports-export">Export Reports</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regular Role */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Regular</h3>
                      <p className="text-sm text-muted-foreground">Basic access for standard users</p>
                    </div>
                    <Badge variant="outline">Basic Access</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Sales & Orders</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="regular-sales-view" defaultChecked />
                        <Label htmlFor="regular-sales-view">View Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="regular-sales-create" defaultChecked />
                        <Label htmlFor="regular-sales-create">Create Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="regular-sales-void" />
                        <Label htmlFor="regular-sales-void">Void Sales</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Inventory</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="regular-inventory-view" defaultChecked />
                        <Label htmlFor="regular-inventory-view">View Inventory</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="regular-inventory-manage" />
                        <Label htmlFor="regular-inventory-manage">Manage Inventory</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Permission Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
