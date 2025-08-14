"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MoreVertical, UserPlus, UserCheck, UserX, Shield, Mail, Edit } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"


// Update the Seller interface to include profileImage
interface Seller {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  profileImage?: string
}

export function AdminSellerManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false)
  // const getSeller = useAuth()

  const [sellers, setSellers] = useState<Seller[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2023-04-12 09:35 AM",
      profileImage:
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2256%22%20height%3D%2256%22%20viewBox%3D%220%200%2056%2056%22%3E%3Cpath%20fill%3D%22%23FF5722%22%20d%3D%22M28%2046.1C14.8%2046.1%204.3%2035.6%204.3%2022.4S14.8-1.3%2028-1.3%2051.7%209.2%2051.7%2022.4%2041.2%2046.1%2028%2046.1zm0-42.9C16.2%203.2%206.8%2012.6%206.8%2024.4S16.2%2045.6%2028%2045.6s21.2-9.4%2021.2-21.2S39.8%203.2%2028%203.2z%22%2F%3E%3Cpath%20fill%3D%22%23FF5722%22%20d%3D%22M28%2036.8c-6.9%200-12.5-5.6-12.5-12.5S21.1%2011.8%2028%2011.8s12.5%205.6%2012.5%2012.5S34.9%2036.8%2028%2036.8zm0-23.5c-6.1%200-11%204.9-11%2011s4.9%2011%2011%2011%2011-4.9%2011-11-4.9-11-11-11z%22%2F%3E%3C%2Fsvg%3E",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "manager",
      status: "active",
      lastLogin: "2023-04-11 02:15 PM",
      profileImage:
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2256%22%20height%3D%2256%22%20viewBox%3D%220%200%2056%2056%22%3E%3Cpath%20fill%3D%22%239C27B0%22%20d%3D%22M28%2046.1C14.8%2046.1%204.3%2035.6%204.3%2022.4S14.8-1.3%2028-1.3%2051.7%209.2%2051.7%2022.4%2041.2%2046.1%2028%2046.1zm0-42.9C16.2%203.2%206.8%2012.6%206.8%2024.4S16.2%2045.6%2028%2045.6s21.2-9.4%2021.2-21.2S39.8%203.2%2028%203.2z%22%2F%3E%3Cpath%20fill%3D%22%239C27B0%22%20d%3D%22M28%2036.8c-6.9%200-12.5-5.6-12.5-12.5S21.1%2011.8%2028%2011.8s12.5%205.6%2012.5%2012.5S34.9%2036.8%2028%2036.8zm0-23.5c-6.1%200-11%204.9-11%2011s4.9%2011%2011%2011%2011-4.9%2011-11-4.9-11-11-11z%22%2F%3E%3C%2Fsvg%3E",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "cashier",
      status: "active",
      lastLogin: "2023-04-10 10:22 AM",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "cashier",
      status: "inactive",
      lastLogin: "2023-03-28 11:45 AM",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      role: "manager",
      status: "active",
      lastLogin: "2023-04-12 08:05 AM",
    },
  ])

  // Add the following state for new seller image
  const [newSellerImage, setNewSellerImage] = useState<string | null>(null)
  // Add state for new seller fields
  const [newSeller, setNewSeller] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  })
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [isEditSellerOpen, setIsEditSellerOpen] = useState(false)

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cashier":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "seller":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Update the handleAddSeller function to use state and ensure all fields are captured
  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    if (
      !newSeller.name.trim() ||
      !newSeller.email.trim() ||
      !newSeller.role.trim() ||
      !newSeller.password ||
      !newSeller.confirmPassword
    ) {
      alert("Please fill in all required fields.")
      return
    }
    if (newSeller.password !== newSeller.confirmPassword) {
      alert("Passwords do not match.")
      return
    }
    // In a real app, this would add the seller to the database with the profile image
    const newSellerObj = {
      id: `${sellers.length + 1}`,
      name: newSeller.name,
      email: newSeller.email,
      role: newSeller.role,
      status: "active" as const,
      lastLogin: "Just now",
      profileImage: newSellerImage || undefined,
      password: newSeller.password,
    }

    setSellers([...sellers, newSellerObj])
    setNewSellerImage(null)
    setIsAddSellerOpen(false)
    setNewSeller({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    })
  }

  // Add a function to handle editing sellers
  const handleEditSeller = () => {
    if (!selectedSeller) return

    // In a real app, this would update the seller in the database
    setSellers(sellers.map((seller) => (seller.id === selectedSeller.id ? selectedSeller : seller)))

    setIsEditSellerOpen(false)
  }

  const handleDeleteSeller = (sellerId: string) => {
    // In a real app, this would delete the seller from the database
    setSellers(sellers.filter((seller) => seller.id !== sellerId))
  }

  const handleToggleSellerStatus = (sellerId: string) => {
    // In a real app, this would update the seller's status in the database
    setSellers(
      sellers.map((seller) =>
        seller.id === sellerId
          ? {
              ...seller,
              status: seller.status === "active" ? "inactive" : "active",
            }
          : seller,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-sellers" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all-sellers">All Sellers</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="cashiers">Cashiers</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sellers..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddSellerOpen} onOpenChange={setIsAddSellerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Seller
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Add New Seller</DialogTitle>
                  <DialogDescription>Create a new seller account with specific role and permissions.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSeller}>
                  <div className="grid gap-4 py-4 md:grid-cols-2">
                  <div className="grid gap-4">
                    <div className="flex justify-center mb-2">
                      <div className="">
                        <ImageUpload
                          initialImage={newSellerImage || undefined}
                          onImageChange={(imageData) => setNewSellerImage(imageData)}
                          aspectRatio={1}
                          entityName="seller profile"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid md:gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        required
                        value={newSeller.name}
                        onChange={e => setNewSeller({ ...newSeller, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.smith@example.com"
                        required
                        value={newSeller.email}
                        onChange={e => setNewSeller({ ...newSeller, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newSeller.role}
                        onValueChange={value => setNewSeller({ ...newSeller, role: value })}
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
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={newSeller.password}
                        onChange={e => setNewSeller({ ...newSeller, password: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={newSeller.confirmPassword}
                        onChange={e => setNewSeller({ ...newSeller, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Seller</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditSellerOpen} onOpenChange={setIsEditSellerOpen}>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Edit Seller</DialogTitle>
                  <DialogDescription>Update seller information and permissions.</DialogDescription>
                </DialogHeader>
                {selectedSeller && (
                  <div className="grid gap-4 py-4 md:grid-cols-2">
                  <div className="grid gap-4">
                    <div className="flex justify-center mb-2">
                      <div className="">
                        <ImageUpload
                          initialImage={selectedSeller.profileImage}
                          onImageChange={(imageData) => {
                            if (selectedSeller) {
                              setSelectedSeller({ ...selectedSeller, profileImage: imageData || undefined })
                            }
                          }}
                          aspectRatio={1}
                          entityName="seller profile"
                        />
                      </div>
                    </div>
                  </div>
                    <div className="grid md:gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input
                          id="edit-name"
                          value={selectedSeller.name}
                          onChange={(e) => setSelectedSeller({ ...selectedSeller, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={selectedSeller.email}
                          onChange={(e) => setSelectedSeller({ ...selectedSeller, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                          value={selectedSeller.role}
                          onValueChange={(value) => setSelectedSeller({ ...selectedSeller, role: value })}
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
                      <div className="grid gap-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select
                          value={selectedSeller.status}
                          onValueChange={(value: "active" | "inactive") =>
                            setSelectedSeller({ ...selectedSeller, status: value })
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
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" onClick={handleEditSeller}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="all-sellers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No sellers found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {seller.profileImage ? (
                                <AvatarImage src={seller.profileImage || "/placeholder.svg"} alt={seller.name} />
                              ) : (
                                <AvatarFallback>{seller.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <span>{seller.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(seller.role)}>
                            {seller.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(seller.status)}>
                            {seller.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{seller.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSeller(seller)
                                  setIsEditSellerOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Seller
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Password Reset
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleSellerStatus(seller.id)}>
                                {seller.status === "active" ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate Seller
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate Seller
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSeller(seller.id)}>
                                Delete Seller
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers
                    .filter((seller) => seller.role === "admin")
                    .map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="font-medium">{seller.name}</TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(seller.status)}>
                            {seller.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{seller.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Password Reset
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleSellerStatus(seller.id)}>
                                {seller.status === "active" ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate Seller
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate Seller
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSeller(seller.id)}>
                                Delete Seller
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar content for other tabs (managers, cashiers, sellers) */}
        {["managers", "cashiers", "sellers"].map((role) => (
          <TabsContent key={role} value={role} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers
                      .filter((seller) => seller.role === role.slice(0, -1))
                      .map((seller) => (
                        <TableRow key={seller.id}>
                          <TableCell className="font-medium">{seller.name}</TableCell>
                          <TableCell>{seller.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(seller.status)}>
                              {seller.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{seller.lastLogin}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Password Reset
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleSellerStatus(seller.id)}>
                                  {seller.status === "active" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Deactivate Seller
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activate Seller
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSeller(seller.id)}>
                                  Delete Seller
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
