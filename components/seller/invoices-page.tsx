"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Mail, AlertTriangle, CreditCard } from "lucide-react"
import { format, addDays } from "date-fns"

interface Invoice {
  id: string
  date: Date
  dueDate: Date
  amount: number
  status: "paid" | "unpaid" | "overdue"
  purchaseOrderId: string
}

const invoices: Invoice[] = [
  {
    id: "INV-2023-001",
    date: new Date(2025, 2, 25),
    dueDate: addDays(new Date(2025, 2, 25), 30),
    amount: 183.46,
    status: "paid",
    purchaseOrderId: "PO-2023-001",
  },
  {
    id: "INV-2023-002",
    date: new Date(2025, 2, 22),
    dueDate: addDays(new Date(2025, 2, 22), 30),
    amount: 293.47,
    status: "unpaid",
    purchaseOrderId: "PO-2023-002",
  },
  {
    id: "INV-2023-003",
    date: new Date(2025, 2, 18),
    dueDate: addDays(new Date(2025, 2, 18), 30),
    amount: 237.92,
    status: "paid",
    purchaseOrderId: "PO-2023-003",
  },
  {
    id: "INV-2023-004",
    date: new Date(2025, 2, 15),
    dueDate: addDays(new Date(2025, 2, 15), 30),
    amount: 113.97,
    status: "unpaid",
    purchaseOrderId: "PO-2023-004",
  },
  {
    id: "INV-2023-005",
    date: new Date(2025, 2, 10),
    dueDate: addDays(new Date(2025, 2, 10), 30),
    amount: 120.98,
    status: "paid",
    purchaseOrderId: "PO-2023-005",
  },
  {
    id: "INV-2023-006",
    date: new Date(2025, 2, 5),
    dueDate: addDays(new Date(2025, 2, 5), 30),
    amount: 122.95,
    status: "overdue",
    purchaseOrderId: "PO-2023-006",
  },
  {
    id: "INV-2023-007",
    date: new Date(2025, 2, 1),
    dueDate: addDays(new Date(2025, 2, 1), 30),
    amount: 183.44,
    status: "paid",
    purchaseOrderId: "PO-2023-007",
  },
]

export function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by search query
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.purchaseOrderId.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by status tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unpaid" && (invoice.status === "unpaid" || invoice.status === "overdue")) ||
      (activeTab === "paid" && invoice.status === "paid") ||
      (activeTab === "overdue" && invoice.status === "overdue")

    return matchesSearch && matchesTab
  })

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "unpaid":
        return <Badge className="bg-amber-500">Unpaid</Badge>
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>
      default:
        return null
    }
  }

  const handlePayNow = (invoiceId: string) => {
    alert(`Processing payment for invoice ${invoiceId}...`)
  }

  const handleDownload = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}...`)
  }

  const handleEmail = (invoiceId: string) => {
    alert(`Emailing invoice ${invoiceId}...`)
  }

  const unpaidTotal = invoices
    .filter((invoice) => invoice.status === "unpaid" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const overdueTotal = invoices
    .filter((invoice) => invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <div className="space-y-6">
      {/* Outstanding Balance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardHeader>
          <CardTitle>Outstanding Balance</CardTitle>
          <CardDescription>Summary of your unpaid invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Unpaid</div>
              <div className="text-3xl font-bold">${unpaidTotal.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                {invoices.filter((invoice) => invoice.status === "unpaid" || invoice.status === "overdue").length}{" "}
                invoices
              </div>
            </div>

            {overdueTotal > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Overdue Amount
                </div>
                <div className="text-3xl font-bold text-red-500">${overdueTotal.toFixed(2)}</div>
                <div className="text-sm text-red-500">
                  {invoices.filter((invoice) => invoice.status === "overdue").length} overdue invoices
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full md:w-auto" disabled={unpaidTotal === 0}>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay All Outstanding Invoices
          </Button>
        </CardFooter>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Invoices</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Purchase Order</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={invoice.status === "overdue" ? "bg-red-50/50 dark:bg-red-950/20" : ""}
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{format(invoice.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{format(invoice.dueDate, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{invoice.purchaseOrderId}</TableCell>
                  <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(invoice.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEmail(invoice.id)}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      {(invoice.status === "unpaid" || invoice.status === "overdue") && (
                        <Button size="sm" onClick={() => handlePayNow(invoice.id)}>
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

