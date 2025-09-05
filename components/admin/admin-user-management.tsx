"use client"

import { useState, useEffect } from "react"
import { HydrationGuard } from "@/components/hydration-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Users, Shield, Crown, UserCheck } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import { usePermissions, useUserPermissions } from "@/hooks/usePermissions"
import { PermissionGuard, UserManagementGuard } from "@/components/auth/PermissionGuard"
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup"
import { SessionManager } from "@/components/auth/SessionManager"
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
    phone?: string
    role: "super_admin" | "admin" | "manager" | "cashier" | "seller"
    lastActive?: Date
    status: "active" | "inactive" | "suspended"
    profileImage?: string
    avatar_url?: string
    last_login_at?: string
    store?: {
      id: string
      name: string
      store_type: string
    }
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
     role: "seller",
     lastActive: new Date(2025, 2, 27, 16, 45),
     status: "active",
   },
   {
     id: "S-004",
     name: "Emily Davis",
     email: "emily.d@example.com",
     phone: "(555) 456-7890",
     role: "seller",
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
     role: "seller",
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
     role: "seller",
     lastActive: new Date(2025, 2, 24, 15, 30),
     status: "inactive",
   },
 ]

const activityLogs: ActivityLog[] = []

const activeUsers: any[] = []

export function AdminUserManagement() {
  const { user, userProfile, organization, store } = useSupabaseAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false)
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "seller",
    password: "",
    confirmPassword: "",
  })
  const [newUserImage, setNewUserImage] = useState<string | null>(null)
  const [inviteUser, setInviteUser] = useState({
    name: "",
    email: "",
    role: "seller",
    message: "",
  })
  const [formData, setFormData] = useState<User | null>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "seller",
    lastActive: new Date(),
    status: "active",
    profileImage: undefined,
  })
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [activityLogsLoading, setActivityLogsLoading] = useState(false)
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [activeUsersLoading, setActiveUsersLoading] = useState(false)
  const [permissions, setPermissions] = useState<any>({})
  const [permissionsByResource, setPermissionsByResource] = useState<any>({})
  const [rolePermissions, setRolePermissions] = useState<any>({})
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch users, activity logs, active users, and permissions on component mount
  useEffect(() => {
    fetchUsers()
    fetchActivityLogs()
    fetchActiveUsers()
    fetchPermissions()
    // Store a flag in localStorage to indicate the welcome page has been shown
    localStorage.setItem("UserManagementPageShown", "true")

    // Debug current user information
    console.log('🔍 DEBUG: AdminUserManagement - Current user info:', {
      user: user,
      organization: organization,
      store: store,
      userRole: user?.user_metadata?.role,
      userEmail: user?.email,
      userId: user?.id,
      userProfileLoaded: !!userProfile,
      userProfileRole: userProfile?.role
    })

    // Log hydration-related information
    if (typeof window !== 'undefined') {
      console.log('🔍 DEBUG: Hydration check - Client-side render detected')
      // Check for browser extensions that might interfere
      const hasBrowserExtensions = document.querySelector('[bis_skin_checked]') !== null
      console.log('🔍 DEBUG: Browser extension interference detected:', hasBrowserExtensions)
    }
  }, [user, organization, store, userProfile])

  // Function to fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

  const response = await fetch('/api/admin/users', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      // Transform API data to match component interface
      const transformedUsers: User[] = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        lastActive: user.last_login_at ? new Date(user.last_login_at) : undefined,
        status: user.status,
        profileImage: user.avatar_url || undefined,
        avatar_url: user.avatar_url,
        last_login_at: user.last_login_at,
        store: user.store || undefined
      }))

      setUsers(transformedUsers)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message || 'Failed to load users')
      // Fallback to mock data if API fails
      setUsers(users)
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch activity logs from API
  const fetchActivityLogs = async () => {
    try {
      setActivityLogsLoading(true)

  const response = await fetch('/api/admin/activity-logs?limit=50', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity logs')
      }

      // Transform API data to match component interface
      const transformedLogs: ActivityLog[] = (data.logs || []).map((log: any) => ({
        id: log.id,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        timestamp: new Date(log.timestamp),
        details: log.details
      }))

      setActivityLogs(transformedLogs)
    } catch (error: any) {
      console.error('Error fetching activity logs:', error)
      // Keep empty array if API fails
      setActivityLogs([])
    } finally {
      setActivityLogsLoading(false)
    }
  }

  // Function to fetch active users from API
  const fetchActiveUsers = async () => {
    try {
      setActiveUsersLoading(true)

  const response = await fetch('/api/admin/active-users', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch active users')
      }

      // Transform API data to match component interface
      const transformedUsers = (data.activeUsers || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        status: user.status,
        currentAction: user.currentAction,
        since: new Date(user.since)
      }))

      setActiveUsers(transformedUsers)
    } catch (error: any) {
      console.error('Error fetching active users:', error)
      // Keep empty array if API fails
      setActiveUsers([])
    } finally {
      setActiveUsersLoading(false)
    }
  }

  // Function to fetch permissions from API
  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true)

  const response = await fetch('/api/admin/permissions', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch permissions')
      }

      setPermissions(data.permissions || [])
      setPermissionsByResource(data.permissionsByResource || {})
      setRolePermissions(data.rolePermissions || {})
    } catch (error: any) {
      console.error('Error fetching permissions:', error)
      // Keep empty objects if API fails
      setPermissions([])
      setPermissionsByResource({})
      setRolePermissions({})
    } finally {
      setPermissionsLoading(false)
    }
  }

  // Function to update role permissions
  const updateRolePermissions = async (role: string, permissionUpdates: any) => {
    try {
  const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          permissionUpdates
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update permissions')
      }

      alert('Permissions updated successfully!')
      // Refresh permissions
      fetchPermissions()
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      alert(`Failed to update permissions: ${error.message}`)
    }
  }

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

  const handleInviteUser = async () => {
    // Validate form
    if (!inviteUser.name || !inviteUser.email || !inviteUser.role) {
      alert("Please fill in all required fields")
      return
    }

    try {
  const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inviteUser.name,
          email: inviteUser.email,
          role: inviteUser.role,
          message: inviteUser.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      alert("Invitation sent successfully!")

      // Reset form and close dialog
      setInviteUser({
        name: "",
        email: "",
        role: "seller",
        message: "",
      })
      setIsInviteUserOpen(false)

    } catch (error: any) {
      console.error('Error sending invitation:', error)
      alert(`Failed to send invitation: ${error.message}`)
    }
  }

  const handleAddUser = async () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields")
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    try {
  const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          phone: newUser.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      // Upload avatar if provided
      if (newUserImage && data.user?.id) {
        try {
          const formData = new FormData()
          formData.append('userId', data.user.id)

          // Convert base64 to blob
          if (newUserImage.startsWith('data:')) {
            const response = await fetch(newUserImage)
            const blob = await response.blob()
            formData.append('avatar', blob, 'avatar.jpg')

      await fetch('/api/admin/users/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
            })
          }
        } catch (avatarError) {
          console.error('Error uploading avatar for new user:', avatarError)
          // Don't fail user creation if avatar upload fails
        }
      }

      alert("User created successfully!")

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "seller",
        password: "",
        confirmPassword: "",
      })
      setNewUserImage(null)
      setIsAddUserOpen(false)

      // Refresh user list
      fetchUsers()

    } catch (error: any) {
      console.error('Error creating user:', error)
      alert(`Failed to create user: ${error.message}`)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          phone: selectedUser.phone,
          status: selectedUser.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      alert("User updated successfully!")
      setIsEditUserOpen(false)

      // Refresh user list
      fetchUsers()

    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error.message}`)
    }
  }

  const handleDeactivateUser = () => {
    // In a real app, this would deactivate the user in the database
    console.log("Deactivating user:", selectedUser)
    alert("User deactivated successfully!")

    // Close dialog
    setIsDeactivateConfirmOpen(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      alert("User deleted successfully!")
      setIsDeleteConfirmOpen(false)

      // Refresh user list
      fetchUsers()

    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(`Failed to delete user: ${error.message}`)
    }
  }

  const handleBulkDeactivate = async () => {
    if (!selectedUserIds.length) return

    if (!confirm(`Are you sure you want to deactivate ${selectedUserIds.length} users?`)) {
      return
    }

    try {
  const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'deactivate',
          userIds: selectedUserIds
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate users')
      }

      alert(`Bulk operation completed!\nSuccess: ${data.successCount}\nFailed: ${data.failureCount}`)

      // Clear selection and refresh user list
      setSelectedUserIds([])
      fetchUsers()
    } catch (error: any) {
      console.error('Error bulk deactivating users:', error)
      alert(`Failed to deactivate users: ${error.message}`)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedUserIds.length) return

    if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} users? This action cannot be undone.`)) {
      return
    }

    try {
  const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'delete',
          userIds: selectedUserIds
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete users')
      }

      alert(`Bulk operation completed!\nSuccess: ${data.successCount}\nFailed: ${data.failureCount}`)

      // Clear selection and refresh user list
      setSelectedUserIds([])
      fetchUsers()
    } catch (error: any) {
      console.error('Error bulk deleting users:', error)
      alert(`Failed to delete users: ${error.message}`)
    }
  }

  const handleBulkActivate = async () => {
    if (!selectedUserIds.length) return

    try {
  const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'activate',
          userIds: selectedUserIds
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate users')
      }

      alert(`Bulk operation completed!\nSuccess: ${data.successCount}\nFailed: ${data.failureCount}`)

      // Clear selection and refresh user list
      setSelectedUserIds([])
      fetchUsers()
    } catch (error: any) {
      console.error('Error bulk activating users:', error)
      alert(`Failed to activate users: ${error.message}`)
    }
  }

  const handleBulkUpdateRole = async (newRole: string) => {
    if (!selectedUserIds.length) return

    try {
  const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'update_role',
          userIds: selectedUserIds,
          data: { role: newRole }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user roles')
      }

      alert(`Bulk operation completed!\nSuccess: ${data.successCount}\nFailed: ${data.failureCount}`)

      // Clear selection and refresh user list
      setSelectedUserIds([])
      fetchUsers()
    } catch (error: any) {
      console.error('Error bulk updating user roles:', error)
      alert(`Failed to update user roles: ${error.message}`)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
  const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: resetPasswordUser.id,
          newPassword,
          sendEmail: true
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      alert('Password reset successfully!')

      // Reset form and close dialog
      setResetPasswordUser(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      alert(`Failed to reset password: ${error.message}`)
    }
  }

  const handleExportUsers = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append('format', format)

      // Add current filters
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }

  const response = await fetch(`/api/admin/users/export?${params.toString()}`, { credentials: 'include' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to export users')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `users_export_${new Date().toISOString().slice(0, 10)}.${format}`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert(`User data exported successfully as ${format.toUpperCase()}!`)
    } catch (error: any) {
      console.error('Error exporting users:', error)
      alert(`Failed to export users: ${error.message}`)
    }
  }

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-500">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-purple-500">Admin</Badge>
      case "manager":
        return <Badge className="bg-blue-500">Manager</Badge>
      case "cashier":
        return <Badge className="bg-green-500">Cashier</Badge>
      case "seller":
        return <Badge className="bg-orange-500">Seller</Badge>
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
      case "suspended":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            Suspended
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
    <HydrationGuard>
      <div className="space-y-6">
      {/* Organization Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold">{organization?.name || store?.name || "User Management"}</h2>
                <p className="text-sm text-muted-foreground">
                  Admin: {user?.user_metadata?.name || user?.email} • {users.length} total users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                {users.filter(u => u.status === "active").length} Active
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                {users.filter(u => u.role === "admin").length} Admins
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Crown className="h-3 w-3 mr-1" />
                {users.filter(u => u.role === "manager").length} Managers
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">
            <User className="mr-2 h-4 w-4" />
            User Accounts
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="mr-2 h-4 w-4" />
            Activity Monitoring
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
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
                <div className="flex gap-2">
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <User className="mr-2 h-4 w-4" />
                        Invite User
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
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
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  <p className="text-sm">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchUsers}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {selectedUserIds.length > 0 && (
                <div className="bg-muted p-2 rounded-md mb-4 flex items-center justify-between">
                  <span className="text-sm">{selectedUserIds.length} users selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                      Activate Selected
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                      Deactivate Selected
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Update Role
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Change Role To</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBulkUpdateRole('manager')}>
                          Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkUpdateRole('cashier')}>
                          Cashier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkUpdateRole('seller')}>
                          Seller
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                          disabled={loading}
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No users found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                              aria-label={`Select ${user.name}`}
                              disabled={loading}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {(user.profileImage || user.avatar_url) ? (
                                  <AvatarImage src={user.profileImage || user.avatar_url || "/placeholder.svg"} alt={user.name} />
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
                          <TableCell>{user.lastActive ? formatDistanceToNow(user.lastActive, { addSuffix: true }) : 'Never'}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={loading}>
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    setResetPasswordUser(user)
                                    setNewPassword('')
                                    setConfirmPassword('')
                                  }}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Reset Password
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
                      ))
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExportUsers('csv')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportUsers('pdf')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                        initialImage={selectedUser.profileImage || selectedUser.avatar_url}
                        onImageChange={async (imageData) => {
                          if (selectedUser && imageData) {
                            try {
                              const formData = new FormData()
                              formData.append('userId', selectedUser.id)

                              // Convert base64 to blob if needed
                              let blob
                              if (imageData.startsWith('data:')) {
                                const response = await fetch(imageData)
                                blob = await response.blob()
                              } else {
                                // Assume it's a file path or URL
                                return
                              }

                              formData.append('avatar', blob, 'avatar.jpg')

                          const response = await fetch('/api/admin/users/upload-avatar', {
                                    method: 'POST',
                                    body: formData,
                                    credentials: 'include'
                              })

                              const data = await response.json()

                              if (!response.ok) {
                                throw new Error(data.error || 'Failed to upload avatar')
                              }

                              // Update the user object with new avatar URL
                              setSelectedUser({
                                ...selectedUser,
                                profileImage: data.avatarUrl,
                                avatar_url: data.avatarUrl
                              })

                              alert('Avatar uploaded successfully!')
                            } catch (error: any) {
                              console.error('Error uploading avatar:', error)
                              alert(`Failed to upload avatar: ${error.message}`)
                            }
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
                        <Input
                          id="edit-name"
                          defaultValue={selectedUser.name}
                          onChange={(e) => {
                            if (selectedUser) {
                              setSelectedUser({ ...selectedUser, name: e.target.value })
                            }
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                          defaultValue={selectedUser.role}
                          onValueChange={(value) => {
                            if (selectedUser) {
                              setSelectedUser({ ...selectedUser, role: value as User["role"] })
                            }
                          }}
                        >
                          <SelectTrigger id="edit-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email Address</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          defaultValue={selectedUser.email}
                          onChange={(e) => {
                            if (selectedUser) {
                              setSelectedUser({ ...selectedUser, email: e.target.value })
                            }
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <Input
                          id="edit-phone"
                          defaultValue={selectedUser.phone}
                          onChange={(e) => {
                            if (selectedUser) {
                              setSelectedUser({ ...selectedUser, phone: e.target.value })
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        defaultValue={selectedUser.status}
                        onValueChange={(value) => {
                          if (selectedUser) {
                            setSelectedUser({ ...selectedUser, status: value as User["status"] })
                          }
                        }}
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
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

          {/* Reset Password Dialog */}
          {resetPasswordUser && (
            <Dialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Set a new password for {resetPasswordUser.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetPasswordUser(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  >
                    Reset Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Add User Dialog */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Enter the user details to create a new account.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 grid-cols-2">
                <div className="grid gap-4">
                    <ImageUpload
                      initialImage={newUserImage || undefined}
                      onImageChange={async (imageData) => {
                        if (imageData) {
                          setNewUserImage(imageData)
                        }
                      }}
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
                            <SelectItem value="seller">Seller</SelectItem>
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

          {/* Invite User Dialog */}
          <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>Send an invitation email to add a new user to your team.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-name">Full Name</Label>
                  <Input
                    id="invite-name"
                    value={inviteUser.name}
                    onChange={(e) => setInviteUser({ ...inviteUser, name: e.target.value })}
                    placeholder="Enter user's full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteUser.email}
                    onChange={(e) => setInviteUser({ ...inviteUser, email: e.target.value })}
                    placeholder="Enter user's email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    value={inviteUser.role}
                    onValueChange={(value) => setInviteUser({ ...inviteUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-message">Message (Optional)</Label>
                  <Input
                    id="invite-message"
                    value={inviteUser.message}
                    onChange={(e) => setInviteUser({ ...inviteUser, message: e.target.value })}
                    placeholder="Add a personal message to the invitation"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Users currently logged into the system</CardDescription>
              </CardHeader>
              <CardContent>
                {activeUsersLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading active users...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {activeUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No active users found</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Active users will appear here when they log in
                          </p>
                        </div>
                      ) : (
                        activeUsers.map((user) => (
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
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActiveUsers}
                  disabled={activeUsersLoading}
                  className="w-full"
                >
                  {activeUsersLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Recent actions performed by users</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogsLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading activity logs...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {activityLogs.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No activity logs found</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Activity logs will appear here as users perform actions
                          </p>
                        </div>
                      ) : (
                        activityLogs.map((log) => (
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
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={fetchActivityLogs}
                  disabled={activityLogsLoading}
                >
                  {activityLogsLoading ? 'Refreshing...' : 'Refresh Activity Logs'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <TwoFactorSetup />
            <SessionManager />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Manage role-based permissions for {organization?.name || store?.name || "your organization"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading permissions...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(permissionsByResource).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No permissions found</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Permissions will be loaded from the database
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Super Admin Role - Always has all permissions */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">Super Admin</h3>
                            <p className="text-sm text-muted-foreground">Full access to all system features</p>
                          </div>
                          <Badge className="bg-red-500">Full Access</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Super admins have access to all permissions automatically.
                        </p>
                      </div>

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
                          {Object.entries(permissionsByResource).map(([resource, perms]: [string, any]) => (
                            <div key={resource} className="space-y-2">
                              <h4 className="text-sm font-medium capitalize">{resource.replace('_', ' ')}</h4>
                              {perms.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`admin-${perm.name}`}
                                    checked={rolePermissions.admin?.[perm.name] || false}
                                    disabled={true} // Admins have all permissions
                                  />
                                  <Label htmlFor={`admin-${perm.name}`}>
                                    {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ))}
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
                          {Object.entries(permissionsByResource).map(([resource, perms]: [string, any]) => (
                            <div key={resource} className="space-y-2">
                              <h4 className="text-sm font-medium capitalize">{resource.replace('_', ' ')}</h4>
                              {perms.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`manager-${perm.name}`}
                                    checked={rolePermissions.manager?.[perm.name] || false}
                                    onCheckedChange={(checked) => {
                                      const updatedPermissions = { ...rolePermissions.manager }
                                      updatedPermissions[perm.name] = checked
                                      setRolePermissions({
                                        ...rolePermissions,
                                        manager: updatedPermissions
                                      })
                                    }}
                                  />
                                  <Label htmlFor={`manager-${perm.name}`}>
                                    {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateRolePermissions('manager', rolePermissions.manager || {})}
                          >
                            Save Manager Permissions
                          </Button>
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
                          {Object.entries(permissionsByResource).map(([resource, perms]: [string, any]) => (
                            <div key={resource} className="space-y-2">
                              <h4 className="text-sm font-medium capitalize">{resource.replace('_', ' ')}</h4>
                              {perms.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`cashier-${perm.name}`}
                                    checked={rolePermissions.cashier?.[perm.name] || false}
                                    onCheckedChange={(checked) => {
                                      const updatedPermissions = { ...rolePermissions.cashier }
                                      updatedPermissions[perm.name] = checked
                                      setRolePermissions({
                                        ...rolePermissions,
                                        cashier: updatedPermissions
                                      })
                                    }}
                                  />
                                  <Label htmlFor={`cashier-${perm.name}`}>
                                    {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateRolePermissions('cashier', rolePermissions.cashier || {})}
                          >
                            Save Cashier Permissions
                          </Button>
                        </div>
                      </div>

                      {/* Seller Role */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">Seller</h3>
                            <p className="text-sm text-muted-foreground">Basic access for sales-focused users</p>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Basic Access</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(permissionsByResource).map(([resource, perms]: [string, any]) => (
                            <div key={resource} className="space-y-2">
                              <h4 className="text-sm font-medium capitalize">{resource.replace('_', ' ')}</h4>
                              {perms.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`seller-${perm.name}`}
                                    checked={rolePermissions.seller?.[perm.name] || false}
                                    onCheckedChange={(checked) => {
                                      const updatedPermissions = { ...rolePermissions.seller }
                                      updatedPermissions[perm.name] = checked
                                      setRolePermissions({
                                        ...rolePermissions,
                                        seller: updatedPermissions
                                      })
                                    }}
                                  />
                                  <Label htmlFor={`seller-${perm.name}`}>
                                    {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateRolePermissions('seller', rolePermissions.seller || {})}
                          >
                            Save Seller Permissions
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={fetchPermissions} disabled={permissionsLoading}>
                {permissionsLoading ? 'Refreshing...' : 'Refresh Permissions'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </HydrationGuard>
  )
}
