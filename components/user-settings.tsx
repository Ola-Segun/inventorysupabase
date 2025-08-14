"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Lock, Bell, Users, Shield, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface UserRole {
  id: string
  name: string
  permissions: string[]
}

const userRoles: UserRole[] = [
  {
    id: "role-admin",
    name: "Administrator",
    permissions: [
      "Manage users",
      "Manage inventory",
      "Manage sales",
      "View reports",
      "Manage settings",
      "Manage menu",
      "Manage tables",
    ],
  },
  {
    id: "role-manager",
    name: "Manager",
    permissions: ["Manage inventory", "Manage sales", "View reports", "Manage menu", "Manage tables"],
  },
  {
    id: "role-cashier",
    name: "Cashier",
    permissions: ["Manage sales", "View reports (limited)"],
  },
  {
    id: "role-waiter",
    name: "Waiter",
    permissions: ["Manage sales", "Manage tables"],
  },
  {
    id: "role-kitchen",
    name: "Kitchen Staff",
    permissions: ["View orders", "Manage menu"],
  },
]

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
}

const staffMembers: StaffMember[] = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "role-admin",
    status: "active",
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "role-manager",
    status: "active",
  },
  {
    id: "user-003",
    name: "Michael Brown",
    email: "mbrown@example.com",
    role: "role-cashier",
    status: "active",
  },
  {
    id: "user-004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "role-waiter",
    status: "active",
  },
  {
    id: "user-005",
    name: "David Wilson",
    email: "dwilson@example.com",
    role: "role-kitchen",
    status: "inactive",
  },
]

export function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    dailySummary: false,
    marketingEmails: false,
  })
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>(staffMembers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addStaffData, setAddStaffData] = useState<Partial<StaffMember>>({
    name: "",
    email: "",
    role: userRoles[0].id,
    status: "active",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProfileUpdate = () => {
    // Validate form
    if (!profileData.name || !profileData.email || !profileData.phone) {
      alert("Please fill in all required fields")
      return
    }

    // In a real app, this would update the profile in the database
    console.log("Updating profile:", profileData)

    // Provide feedback
    alert("Profile updated successfully!")
  }

  const handlePasswordUpdate = () => {
    // Validate form
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Please fill in all password fields")
      return
    }

    // In a real app, this would update the password in the database
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    console.log("Updating password")

    // Provide feedback
    alert("Password updated successfully!")

    // Reset form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleNotificationUpdate = () => {
    // In a real app, this would update the notification settings in the database
    console.log("Updating notification settings:", notificationSettings)
    alert("Notification settings updated successfully!")
  }

  // Add Staff Member
  const handleAddStaff = () => {
    if (!addStaffData.name || !addStaffData.email || !addStaffData.role) {
      alert("Please fill in all fields")
      return
    }
    setIsProcessing(true)
    setTimeout(() => {
      setStaff([
        ...staff,
        {
          id: `user-${Math.random().toString(36).slice(2, 8)}`,
          name: addStaffData.name!,
          email: addStaffData.email!,
          role: addStaffData.role!,
          status: addStaffData.status as "active" | "inactive",
        },
      ])
      setAddStaffData({ name: "", email: "", role: userRoles[0].id, status: "active" })
      setIsAddDialogOpen(false)
      setIsProcessing(false)
      alert("Staff member added!")
    }, 800)
  }

  // Edit Staff Member
  const handleEditStaff = () => {
    if (!selectedStaffMember) return
    setIsProcessing(true)
    setTimeout(() => {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === selectedStaffMember.id ? { ...selectedStaffMember } : s
        )
      )
      setSelectedStaffMember(null)
      setIsProcessing(false)
      alert("Staff member updated!")
    }, 800)
  }

  // Delete Staff Member
  const handleDeleteStaff = () => {
    if (!deleteTarget) return
    setIsProcessing(true)
    setTimeout(() => {
      setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      setSelectedStaffMember(null)
      setIsDeleteDialogOpen(false)
      setIsProcessing(false)
      alert("Staff member deleted!")
    }, 800)
  }

  // Toggle Active/Inactive
  const handleToggleStatus = (member: StaffMember) => {
    if (!window.confirm(`Are you sure you want to ${member.status === "active" ? "deactivate" : "activate"} this user?`)) return
    setIsProcessing(true)
    setTimeout(() => {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, status: member.status === "active" ? "inactive" : "active" } : s
        )
      )
      setIsProcessing(false)
      alert(`User ${member.status === "active" ? "deactivated" : "activated"}!`)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="mr-2 h-4 w-4" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc-8">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="utc-0">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="cad">CAD ($)</SelectItem>
                        <SelectItem value="aud">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Update your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordUpdate}>Update Password</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button variant="outline">Set Up Two-Factor Authentication</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Login Sessions</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Current Session</div>
                        <div className="text-sm text-muted-foreground">Windows 10 • Chrome • California, USA</div>
                      </div>
                      <div className="text-sm text-green-600">Active Now</div>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">MacOS Session</div>
                        <div className="text-sm text-muted-foreground">MacOS • Safari • California, USA</div>
                      </div>
                      <div className="text-sm text-muted-foreground">2 days ago</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">iPhone Session</div>
                        <div className="text-sm text-muted-foreground">iOS • Safari • California, USA</div>
                      </div>
                      <div className="text-sm text-muted-foreground">5 days ago</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline">Log Out All Other Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive notifications on your device</div>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Low Stock Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when inventory items are running low
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Order Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified about new orders and order status changes
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, orderUpdates: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Daily Summary</div>
                      <div className="text-sm text-muted-foreground">
                        Receive a daily summary of sales and inventory
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.dailySummary}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, dailySummary: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">Receive promotional emails and updates</div>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNotificationUpdate}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Manage staff members and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Staff Members</h3>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  </div>
                </div>
                <div className="divide-y">
                  {staff.map((staff) => {
                    const role = userRoles.find((r) => r.id === staff.role)
                    return (
                      <div key={staff.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {staff.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-muted-foreground">{staff.email}</div>
                              <div className="text-sm">{role?.name || "Unknown Role"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStaffMember(staff)}
                              disabled={isProcessing}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={staff.status === "active" ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleToggleStatus(staff)}
                              disabled={isProcessing}
                            >
                              {staff.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Roles</h3>
                <div className="rounded-md border">
                  {userRoles.map((role) => (
                    <div key={role.id} className="p-4 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.permissions.length} permissions</div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Shield className="mr-2 h-4 w-4" />
                          Edit Permissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Staff Member Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
                <DialogDescription>
                  Enter details for the new staff member.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input
                    id="add-name"
                    value={addStaffData.name || ""}
                    onChange={(e) => setAddStaffData({ ...addStaffData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-email">Email Address</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addStaffData.email || ""}
                    onChange={(e) => setAddStaffData({ ...addStaffData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-role">Role</Label>
                  <Select
                    value={addStaffData.role}
                    onValueChange={(value) => setAddStaffData({ ...addStaffData, role: value })}
                  >
                    <SelectTrigger id="add-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-status">Status</Label>
                  <Select
                    value={addStaffData.status}
                    onValueChange={(value) => setAddStaffData({ ...addStaffData, status: value as "active" | "inactive" })}
                  >
                    <SelectTrigger id="add-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex justify-end">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} disabled={isProcessing}>
                  {isProcessing ? "Adding..." : "Add Staff"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Staff Member Dialog */}
          {selectedStaffMember && (
            <Dialog open={!!selectedStaffMember} onOpenChange={(open) => !open && setSelectedStaffMember(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Staff Member</DialogTitle>
                  <DialogDescription>
                    Update information for {selectedStaffMember.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedStaffMember.name}
                      onChange={(e) =>
                        setSelectedStaffMember({ ...selectedStaffMember, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedStaffMember.email}
                      onChange={(e) =>
                        setSelectedStaffMember({ ...selectedStaffMember, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={selectedStaffMember.role}
                      onValueChange={(value) =>
                        setSelectedStaffMember({ ...selectedStaffMember, role: value })
                      }
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedStaffMember.status}
                      onValueChange={(value) =>
                        setSelectedStaffMember({ ...selectedStaffMember, status: value as "active" | "inactive" })
                      }
                    >
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
                <DialogFooter className="flex justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteTarget(selectedStaffMember)
                      setIsDeleteDialogOpen(true)
                    }}
                    disabled={isProcessing}
                  >
                    Delete User
                  </Button>
                  <Button onClick={handleEditStaff} disabled={isProcessing}>
                    {isProcessing ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Staff Member Dialog */}
          {deleteTarget && (
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Delete Staff Member</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {deleteTarget.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteStaff} disabled={isProcessing}>
                    {isProcessing ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

