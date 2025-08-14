"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { DateRange } from "@/components/ui/calendar"
import { DateRangePicker } from "@/components/date-range-picker"
import { Search, Download, Filter, RefreshCw, ArrowUpDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ActivityLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  module: string
  details: string
  ipAddress: string
  timestamp: Date
  status: "success" | "warning" | "error" | "info"
}

// Sample data for user activity logs
const sampleActivityLogs: ActivityLog[] = [
  {
    id: "log-001",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Login",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 9, 30),
    status: "success",
  },
  {
    id: "log-002",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "View",
    module: "Products",
    details: "Viewed product list",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 9, 35),
    status: "info",
  },
  {
    id: "log-003",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Create",
    module: "Products",
    details: "Added new product: Classic Burger",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 9, 40),
    status: "success",
  },
  {
    id: "log-004",
    userId: "user-456",
    userName: "Jane Smith",
    userRole: "Cashier",
    action: "Login",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.2",
    timestamp: new Date(2025, 4, 21, 10, 0),
    status: "success",
  },
  {
    id: "log-005",
    userId: "user-456",
    userName: "Jane Smith",
    userRole: "Cashier",
    action: "Create",
    module: "Sales",
    details: "Created new sale: Order #ORD-123456",
    ipAddress: "192.168.1.2",
    timestamp: new Date(2025, 4, 21, 10, 15),
    status: "success",
  },
  {
    id: "log-006",
    userId: "user-789",
    userName: "Bob Johnson",
    userRole: "Inventory Manager",
    action: "Update",
    module: "Inventory",
    details: "Updated stock for product: French Fries (ID: p5)",
    ipAddress: "192.168.1.3",
    timestamp: new Date(2025, 4, 21, 11, 0),
    status: "success",
  },
  {
    id: "log-007",
    userId: "user-789",
    userName: "Bob Johnson",
    userRole: "Inventory Manager",
    action: "Failed Update",
    module: "Inventory",
    details: "Failed to update stock for product: Onion Rings (ID: p6) - Insufficient permissions",
    ipAddress: "192.168.1.3",
    timestamp: new Date(2025, 4, 21, 11, 5),
    status: "error",
  },
  {
    id: "log-008",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Delete",
    module: "Products",
    details: "Deleted product: Discontinued Item (ID: p99)",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 11, 30),
    status: "warning",
  },
  {
    id: "log-009",
    userId: "user-456",
    userName: "Jane Smith",
    userRole: "Cashier",
    action: "View",
    module: "Reports",
    details: "Viewed daily sales report",
    ipAddress: "192.168.1.2",
    timestamp: new Date(2025, 4, 21, 12, 0),
    status: "info",
  },
  {
    id: "log-010",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Export",
    module: "Reports",
    details: "Exported monthly sales report",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 13, 0),
    status: "success",
  },
  {
    id: "log-011",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Update",
    module: "Settings",
    details: "Updated system settings: Tax rate changed from 8% to 8.5%",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 14, 0),
    status: "warning",
  },
  {
    id: "log-012",
    userId: "user-789",
    userName: "Bob Johnson",
    userRole: "Inventory Manager",
    action: "Create",
    module: "Purchase Orders",
    details: "Created new purchase order: PO-2025-001",
    ipAddress: "192.168.1.3",
    timestamp: new Date(2025, 4, 21, 15, 0),
    status: "success",
  },
  {
    id: "log-013",
    userId: "user-456",
    userName: "Jane Smith",
    userRole: "Cashier",
    action: "Logout",
    module: "Authentication",
    details: "User logged out",
    ipAddress: "192.168.1.2",
    timestamp: new Date(2025, 4, 21, 16, 0),
    status: "info",
  },
  {
    id: "log-014",
    userId: "user-789",
    userName: "Bob Johnson",
    userRole: "Inventory Manager",
    action: "Failed Login",
    module: "Authentication",
    details: "Failed login attempt - incorrect password",
    ipAddress: "192.168.1.4",
    timestamp: new Date(2025, 4, 21, 16, 30),
    status: "error",
  },
  {
    id: "log-015",
    userId: "user-123",
    userName: "John Doe",
    userRole: "Admin",
    action: "Create",
    module: "Users",
    details: "Created new user: Sarah Williams (ID: user-999)",
    ipAddress: "192.168.1.1",
    timestamp: new Date(2025, 4, 21, 17, 0),
    status: "success",
  },
]

export function UserActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(sampleActivityLogs)
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(sampleActivityLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<keyof ActivityLog>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Get unique users, modules, actions, and statuses for filters
  const uniqueUsers = Array.from(new Set(logs.map((log) => log.userName)))
  const uniqueModules = Array.from(new Set(logs.map((log) => log.module)))
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))
  const uniqueStatuses = Array.from(new Set(logs.map((log) => log.status)))

  // Apply filters
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let result = [...logs]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (log) =>
            log.userName.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.module.toLowerCase().includes(query) ||
            log.details.toLowerCase().includes(query),
        )
      }

      // Apply user filter
      if (userFilter !== "all") {
        result = result.filter((log) => log.userName === userFilter)
      }

      // Apply module filter
      if (moduleFilter !== "all") {
        result = result.filter((log) => log.module === moduleFilter)
      }

      // Apply action filter
      if (actionFilter !== "all") {
        result = result.filter((log) => log.action === actionFilter)
      }

      // Apply status filter
      if (statusFilter !== "all") {
        result = result.filter((log) => log.status === statusFilter)
      }

      // Apply date range filter
      if (dateRange?.from) {
        result = result.filter((log) => {
          const logDate = new Date(log.timestamp)
          if (dateRange.from && logDate < dateRange.from) return false
          if (dateRange.to && logDate > dateRange.to) return false
          return true
        })
      }

      // Apply sorting
      result.sort((a, b) => {
        if (sortField === "timestamp") {
          return sortDirection === "asc"
            ? a.timestamp.getTime() - b.timestamp.getTime()
            : b.timestamp.getTime() - a.timestamp.getTime()
        }

        const aValue = String(a[sortField])
        const bValue = String(b[sortField])

        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      })

      setFilteredLogs(result)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [logs, searchQuery, userFilter, moduleFilter, actionFilter, statusFilter, dateRange, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: keyof ActivityLog) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setUserFilter("all")
    setModuleFilter("all")
    setActionFilter("all")
    setStatusFilter("all")
    setDateRange(undefined)
    setSortField("timestamp")
    setSortDirection("desc")
    setCurrentPage(1)
  }

  // Export logs
  const exportLogs = () => {
    setIsLoading(true)

    // Simulate export delay
    setTimeout(() => {
      // In a real app, this would generate a CSV or Excel file
      alert("Logs exported successfully!")
      setIsLoading(false)
    }, 1000)
  }

  // Get status badge
  const getStatusBadge = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>
      case "error":
        return <Badge className="bg-red-500">Error</Badge>
      case "info":
        return <Badge className="bg-blue-500">Info</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DateRangePicker
                value={dateRange}
                onValueChange={setDateRange}
                align="end"
                className="w-full md:w-auto"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {uniqueModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>

              <Button variant="outline" onClick={exportLogs} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Activity Log Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <RefreshCw className="animate-spin h-8 w-8 mb-2" />
            <span>Loading activity logs...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("timestamp")}>
                    <div className="flex items-center">
                      Timestamp
                      {sortField === "timestamp" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("userName")}>
                    <div className="flex items-center">
                      User
                      {sortField === "userName" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("action")}>
                    <div className="flex items-center">
                      Action
                      {sortField === "action" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("module")}>
                    <div className="flex items-center">
                      Module
                      {sortField === "module" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userRole}</div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length}{" "}
              logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = index + 1
                } else if (currentPage <= 3) {
                  pageNumber = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index
                } else {
                  pageNumber = currentPage - 2 + index
                }

                return (
                  <Button
                    key={index}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
