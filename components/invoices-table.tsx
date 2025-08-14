"use client"

import { useState } from "react"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, MoreHorizontal, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define invoice status types
type InvoiceStatus = "paid" | "due" | "overdue" | "cancelled"

// Sample invoices data
const invoicesData = [
  {
    id: "INV-1001",
    customer: "John Smith",
    date: "2023-04-10",
    dueDate: "2023-05-10",
    total: 450.75,
    status: "paid" as InvoiceStatus,
  },
  {
    id: "INV-1002",
    customer: "Emily Johnson",
    date: "2023-04-12",
    dueDate: "2023-05-12",
    total: 325.5,
    status: "due" as InvoiceStatus,
  },
  {
    id: "INV-1003",
    customer: "Michael Davis",
    date: "2023-04-15",
    dueDate: "2023-05-15",
    total: 780.25,
    status: "overdue" as InvoiceStatus,
  },
  {
    id: "INV-1004",
    customer: "Sarah Wilson",
    date: "2023-04-18",
    dueDate: "2023-05-18",
    total: 560.0,
    status: "paid" as InvoiceStatus,
  },
  {
    id: "INV-1005",
    customer: "David Thompson",
    date: "2023-04-20",
    dueDate: "2023-05-20",
    total: 215.75,
    status: "due" as InvoiceStatus,
  },
  {
    id: "INV-1006",
    customer: "Jessica Lee",
    date: "2023-04-22",
    dueDate: "2023-05-22",
    total: 645.3,
    status: "cancelled" as InvoiceStatus,
  },
  {
    id: "INV-1007",
    customer: "Robert Brown",
    date: "2023-04-25",
    dueDate: "2023-05-25",
    total: 890.5,
    status: "paid" as InvoiceStatus,
  },
  {
    id: "INV-1008",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1009",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1010",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1011",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1012",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1013",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1014",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
    {
    id: "INV-1015",
    customer: "Jennifer Miller",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    total: 420.25,
    status: "due" as InvoiceStatus,
  },
]

export function InvoicesTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoicesData.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Function to get status badge
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Paid
          </Badge>
        )
      case "due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Due
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
        <CardHeader className="flex gap-2 flex-1">
      <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
          <Input
            placeholder="Search by invoice ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
      </div>
        </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No invoices found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length}{" "}
            categories
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
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
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
    </Card>
  )
}

