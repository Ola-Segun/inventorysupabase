"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, ArrowUpDown } from "lucide-react"
import { format, isWithinInterval } from "date-fns"

interface SaleTransaction {
  id: string
  date: Date
  customer: string
  items: number
  total: number
  payment: "credit" | "cash" | "digital"
  status: "completed" | "refunded" | "pending"
}

// Sample data
const allTransactions: SaleTransaction[] = [
  {
    id: "INV-001",
    date: new Date(2025, 2, 28, 9, 14),
    customer: "John Smith",
    items: 5,
    total: 42.99,
    payment: "credit",
    status: "completed",
  },
  {
    id: "INV-002",
    date: new Date(2025, 2, 28, 10, 23),
    customer: "Sarah Johnson",
    items: 3,
    total: 28.5,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-003",
    date: new Date(2025, 2, 27, 14, 45),
    customer: "Michael Brown",
    items: 8,
    total: 76.25,
    payment: "credit",
    status: "completed",
  },
  {
    id: "INV-004",
    date: new Date(2025, 2, 27, 11, 32),
    customer: "Emily Davis",
    items: 2,
    total: 15.99,
    payment: "digital",
    status: "refunded",
  },
  {
    id: "INV-005",
    date: new Date(2025, 2, 26, 16, 17),
    customer: "David Wilson",
    items: 4,
    total: 32.75,
    payment: "credit",
    status: "completed",
  },
  {
    id: "INV-006",
    date: new Date(2025, 2, 26, 13, 5),
    customer: "Jennifer Taylor",
    items: 6,
    total: 54.5,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-007",
    date: new Date(2025, 2, 25, 15, 28),
    customer: "Robert Anderson",
    items: 1,
    total: 8.99,
    payment: "digital",
    status: "pending",
  },
  {
    id: "INV-008",
    date: new Date(2025, 2, 25, 10, 42),
    customer: "Lisa Thomas",
    items: 7,
    total: 67.25,
    payment: "credit",
    status: "completed",
  },
  {
    id: "INV-009",
    date: new Date(2025, 2, 24, 14, 15),
    customer: "James Martin",
    items: 3,
    total: 24.99,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-010",
    date: new Date(2025, 2, 24, 9, 30),
    customer: "Patricia White",
    items: 5,
    total: 45.75,
    payment: "digital",
    status: "completed",
  },
  // Additional transactions for earlier dates
  {
    id: "INV-011",
    date: new Date(2025, 2, 20, 11, 45),
    customer: "Thomas Johnson",
    items: 4,
    total: 38.5,
    payment: "credit",
    status: "completed",
  },
  {
    id: "INV-012",
    date: new Date(2025, 2, 18, 13, 20),
    customer: "Jessica Brown",
    items: 2,
    total: 22.99,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-013",
    date: new Date(2025, 2, 15, 10, 10),
    customer: "William Davis",
    items: 6,
    total: 65.75,
    payment: "digital",
    status: "completed",
  },
  {
    id: "INV-014",
    date: new Date(2025, 2, 12, 16, 30),
    customer: "Elizabeth Wilson",
    items: 3,
    total: 29.99,
    payment: "credit",
    status: "refunded",
  },
  {
    id: "INV-015",
    date: new Date(2025, 2, 10, 9, 45),
    customer: "Richard Taylor",
    items: 5,
    total: 47.5,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-016",
    date: new Date(2025, 2, 8, 14, 15),
    customer: "Susan Anderson",
    items: 7,
    total: 72.25,
    payment: "digital",
    status: "completed",
  },
  {
    id: "INV-017",
    date: new Date(2025, 2, 5, 11, 30),
    customer: "Joseph Thomas",
    items: 2,
    total: 18.99,
    payment: "credit",
    status: "pending",
  },
  {
    id: "INV-018",
    date: new Date(2025, 2, 3, 10, 20),
    customer: "Margaret Martin",
    items: 4,
    total: 36.5,
    payment: "cash",
    status: "completed",
  },
  {
    id: "INV-019",
    date: new Date(2025, 2, 1, 15, 45),
    customer: "Charles White",
    items: 6,
    total: 58.75,
    payment: "digital",
    status: "completed",
  },
  {
    id: "INV-020",
    date: new Date(2025, 1, 28, 13, 10),
    customer: "Dorothy Johnson",
    items: 3,
    total: 32.99,
    payment: "credit",
    status: "completed",
  },
]

interface SalesTableProps {
  startDate?: Date
  endDate?: Date
}

export function SalesTable({ startDate, endDate }: SalesTableProps) {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof SaleTransaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredData = [...allTransactions]

      // Filter by date range if provided
      if (startDate && endDate) {
        filteredData = filteredData.filter((transaction) =>
          isWithinInterval(transaction.date, { start: startDate, end: endDate }),
        )
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          (transaction) =>
            transaction.id.toLowerCase().includes(query) || transaction.customer.toLowerCase().includes(query),
        )
      }

      // Sort data
      filteredData.sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "asc" ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime()
        }

        if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
          return sortDirection === "asc"
            ? (a[sortField] as string).localeCompare(b[sortField] as string)
            : (b[sortField] as string).localeCompare(a[sortField] as string)
        }

        return sortDirection === "asc"
          ? (a[sortField] as number) - (b[sortField] as number)
          : (b[sortField] as number) - (a[sortField] as number)
      })

      setTransactions(filteredData)
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [startDate, endDate, searchQuery, sortField, sortDirection])

  const getStatusColor = (status: SaleTransaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "refunded":
        return "bg-red-500 hover:bg-red-600"
      case "pending":
        return "bg-amber-500 hover:bg-amber-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  const getPaymentMethod = (payment: SaleTransaction["payment"]) => {
    switch (payment) {
      case "credit":
        return "Credit Card"
      case "cash":
        return "Cash"
      case "digital":
        return "Digital Wallet"
      default:
        return "Unknown"
    }
  }

  const handleSort = (field: keyof SaleTransaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              className="animate-spin h-8 w-8 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading transactions...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                    <div className="flex items-center">
                      Invoice
                      {sortField === "id" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                    <div className="flex items-center">
                      Date & Time
                      {sortField === "date" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
                    <div className="flex items-center">
                      Customer
                      {sortField === "customer" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("items")}>
                    <div className="flex items-center justify-end">
                      Items
                      {sortField === "items" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total")}>
                    <div className="flex items-center justify-end">
                      Total
                      {sortField === "total" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{format(transaction.date, "MMM dd, yyyy hh:mm a")}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell className="text-right">{transaction.items}</TableCell>
                      <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                      <TableCell>{getPaymentMethod(transaction.payment)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, transactions.length)} of {transactions.length}{" "}
              transactions
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
          </div>
        </>
      )}
    </div>
  )
}

