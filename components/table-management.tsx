"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, Utensils, Plus, CalendarPlus2Icon as CalendarIcon2 } from "lucide-react"
import { TableLayoutView } from "@/components/table-layout-view"

interface Table {
  id: string
  name: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  section: "main" | "outdoor" | "private" | "bar"
  currentOrder?: {
    id: string
    items: number
    startTime: string
    total: number
  }
}

const tables: Table[] = [
  {
    id: "TABLE-01",
    name: "Table 1",
    capacity: 2,
    status: "available",
    section: "main",
  },
  {
    id: "TABLE-02",
    name: "Table 2",
    capacity: 4,
    status: "occupied",
    section: "main",
    currentOrder: {
      id: "ORD-1234",
      items: 6,
      startTime: "12:30 PM",
      total: 78.5,
    },
  },
  {
    id: "TABLE-03",
    name: "Table 3",
    capacity: 4,
    status: "reserved",
    section: "main",
  },
  {
    id: "TABLE-04",
    name: "Table 4",
    capacity: 6,
    status: "available",
    section: "main",
  },
  {
    id: "TABLE-05",
    name: "Table 5",
    capacity: 8,
    status: "occupied",
    section: "main",
    currentOrder: {
      id: "ORD-1235",
      items: 12,
      startTime: "1:15 PM",
      total: 145.75,
    },
  },
  {
    id: "TABLE-06",
    name: "Table 6",
    capacity: 2,
    status: "cleaning",
    section: "main",
  },
  {
    id: "TABLE-07",
    name: "Outdoor 1",
    capacity: 4,
    status: "available",
    section: "outdoor",
  },
  {
    id: "TABLE-08",
    name: "Outdoor 2",
    capacity: 4,
    status: "occupied",
    section: "outdoor",
    currentOrder: {
      id: "ORD-1236",
      items: 4,
      startTime: "12:45 PM",
      total: 52.25,
    },
  },
  {
    id: "TABLE-09",
    name: "Private Room",
    capacity: 12,
    status: "reserved",
    section: "private",
  },
  {
    id: "TABLE-10",
    name: "Bar Seat 1",
    capacity: 1,
    status: "available",
    section: "bar",
  },
  {
    id: "TABLE-11",
    name: "Bar Seat 2",
    capacity: 1,
    status: "occupied",
    section: "bar",
    currentOrder: {
      id: "ORD-1237",
      items: 2,
      startTime: "1:30 PM",
      total: 18.5,
    },
  },
  {
    id: "TABLE-12",
    name: "Bar Seat 3",
    capacity: 1,
    status: "available",
    section: "bar",
  },
]

interface Reservation {
  id: string
  customerName: string
  phone: string
  date: string
  time: string
  guests: number
  tableId: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  notes: string
}

const reservations: Reservation[] = [
  {
    id: "RES-001",
    customerName: "John Smith",
    phone: "(555) 123-4567",
    date: "2025-03-28",
    time: "7:00 PM",
    guests: 4,
    tableId: "TABLE-03",
    status: "confirmed",
    notes: "Anniversary celebration",
  },
  {
    id: "RES-002",
    customerName: "Sarah Johnson",
    phone: "(555) 234-5678",
    date: "2025-03-28",
    time: "8:30 PM",
    guests: 2,
    tableId: "TABLE-01",
    status: "confirmed",
    notes: "",
  },
  {
    id: "RES-003",
    customerName: "Michael Brown",
    phone: "(555) 345-6789",
    date: "2025-03-29",
    time: "6:30 PM",
    guests: 6,
    tableId: "TABLE-04",
    status: "confirmed",
    notes: "Prefers window seating",
  },
  {
    id: "RES-004",
    customerName: "Emily Davis",
    phone: "(555) 456-7890",
    date: "2025-03-29",
    time: "7:30 PM",
    guests: 8,
    tableId: "TABLE-05",
    status: "pending",
    notes: "Birthday celebration, will bring cake",
  },
  {
    id: "RES-005",
    customerName: "David Wilson",
    phone: "(555) 567-8901",
    date: "2025-03-30",
    time: "6:00 PM",
    guests: 12,
    tableId: "TABLE-09",
    status: "confirmed",
    notes: "Corporate dinner",
  },
]

export function TableManagement() {
  const [activeTab, setActiveTab] = useState("layout")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [newReservation, setNewReservation] = useState({
    customerName: "",
    phone: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "19:00",
    guests: 2,
    tableId: "",
    notes: "",
  })

  const filteredTables = tables.filter((table) => {
    if (selectedSection === "all") return true
    return table.section === selectedSection
  })

  const handleAddReservation = () => {
    // Validate form
    if (
      !newReservation.customerName ||
      !newReservation.phone ||
      !newReservation.date ||
      !newReservation.time ||
      !newReservation.tableId
    ) {
      alert("Please fill in all required fields")
      return
    }

    // Validate guest count
    if (newReservation.guests < 1) {
      alert("Please enter a valid number of guests")
      return
    }

    // In a real app, this would add the reservation to the database
    console.log("Adding reservation:", newReservation)

    // Provide feedback
    alert(
      `Reservation for ${newReservation.customerName} on ${newReservation.date} at ${newReservation.time} has been created successfully!`,
    )

    // Reset form and close dialog
    setNewReservation({
      customerName: "",
      phone: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "19:00",
      guests: 2,
      tableId: "",
      notes: "",
    })
    setIsAddReservationOpen(false)
  }

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-blue-500"
      case "cleaning":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Table["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getReservationStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">
            <Utensils className="mr-2 h-4 w-4" />
            Table List
          </TabsTrigger>
          <TabsTrigger value="visual">
            <Utensils className="mr-2 h-4 w-4" />
            Visual Layout
          </TabsTrigger>
          <TabsTrigger value="reservations">
            <CalendarIcon2 className="mr-2 h-4 w-4" />
            Reservations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <CardTitle>Restaurant Floor Plan</CardTitle>
                  <CardDescription>View and manage table status</CardDescription>
                </div>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="main">Main Dining</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="private">Private Rooms</SelectItem>
                    <SelectItem value="bar">Bar Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredTables.map((table) => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedTable?.id === table.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{table.name}</CardTitle>
                        <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
                      </div>
                      <CardDescription>
                        {table.section.charAt(0).toUpperCase() + table.section.slice(1)} Section
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Capacity: {table.capacity}</span>
                      </div>
                      {table.currentOrder && (
                        <div className="text-sm text-muted-foreground">
                          Order #{table.currentOrder.id.split("-")[1]} - ${table.currentOrder.total.toFixed(2)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTable && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTable.name} Details</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTable(null)}>
                    Close
                  </Button>
                </div>
                <CardDescription>
                  {selectedTable.section.charAt(0).toUpperCase() + selectedTable.section.slice(1)} Section - Capacity:{" "}
                  {selectedTable.capacity}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Current Status</h3>
                      <Badge className={getStatusColor(selectedTable.status)}>
                        {getStatusText(selectedTable.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue={selectedTable.status}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>Update</Button>
                    </div>
                  </div>

                  {selectedTable.status === "occupied" && selectedTable.currentOrder && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Current Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span>{selectedTable.currentOrder.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Items:</span>
                            <span>{selectedTable.currentOrder.items}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Time:</span>
                            <span>{selectedTable.currentOrder.startTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span>${selectedTable.currentOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">View Order</Button>
                        <Button>Complete Order</Button>
                      </CardFooter>
                    </Card>
                  )}

                  {selectedTable.status === "available" && (
                    <div className="flex justify-between">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddReservationOpen(true)
                          setNewReservation({
                            ...newReservation,
                            tableId: selectedTable.id,
                          })
                        }}
                      >
                        <CalendarIcon2 className="mr-2 h-4 w-4" />
                        Make Reservation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visual" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <CardTitle>Restaurant Floor Plan</CardTitle>
                  <CardDescription>Visual representation of your restaurant layout</CardDescription>
                </div>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="main">Main Dining</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="private">Private Rooms</SelectItem>
                    <SelectItem value="bar">Bar Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <TableLayoutView
                tables={filteredTables}
                onSelectTable={setSelectedTable}
                selectedTableId={selectedTable?.id}
              />
            </CardContent>
          </Card>

          {selectedTable && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTable.name} Details</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTable(null)}>
                    Close
                  </Button>
                </div>
                <CardDescription>
                  {selectedTable.section.charAt(0).toUpperCase() + selectedTable.section.slice(1)} Section - Capacity:{" "}
                  {selectedTable.capacity}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same content as in the list view */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Current Status</h3>
                      <Badge className={getStatusColor(selectedTable.status)}>
                        {getStatusText(selectedTable.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue={selectedTable.status}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>Update</Button>
                    </div>
                  </div>

                  {selectedTable.status === "occupied" && selectedTable.currentOrder && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Current Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span>{selectedTable.currentOrder.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Items:</span>
                            <span>{selectedTable.currentOrder.items}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Time:</span>
                            <span>{selectedTable.currentOrder.startTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span>${selectedTable.currentOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">View Order</Button>
                        <Button>Complete Order</Button>
                      </CardFooter>
                    </Card>
                  )}

                  {selectedTable.status === "available" && (
                    <div className="flex justify-between">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddReservationOpen(true)
                          setNewReservation({
                            ...newReservation,
                            tableId: selectedTable.id,
                          })
                        }}
                      >
                        <CalendarIcon2 className="mr-2 h-4 w-4" />
                        Make Reservation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <CardTitle>Reservations</CardTitle>
                  <CardDescription>Manage upcoming reservations</CardDescription>
                </div>
                <Dialog open={isAddReservationOpen} onOpenChange={setIsAddReservationOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Reservation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Reservation</DialogTitle>
                      <DialogDescription>Enter the reservation details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="customerName">Customer Name</Label>
                          <Input
                            id="customerName"
                            value={newReservation.customerName}
                            onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={newReservation.phone}
                            onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newReservation.date ? (
                                  format(new Date(newReservation.date), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(date) => {
                                  setDate(date)
                                  if (date) {
                                    setNewReservation({ ...newReservation, date: format(date, "yyyy-MM-dd") })
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newReservation.time}
                            onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="guests">Number of Guests</Label>
                          <Input
                            id="guests"
                            type="number"
                            min="1"
                            value={newReservation.guests}
                            onChange={(e) =>
                              setNewReservation({ ...newReservation, guests: Number.parseInt(e.target.value) || 1 })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="table">Table</Label>
                          <Select
                            value={newReservation.tableId}
                            onValueChange={(value) => setNewReservation({ ...newReservation, tableId: value })}
                          >
                            <SelectTrigger id="table">
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {tables.map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  {table.name} (Capacity: {table.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Special Requests/Notes</Label>
                        <Input
                          id="notes"
                          value={newReservation.notes}
                          onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddReservationOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddReservation}>Add Reservation</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.map((reservation) => {
                  const table = tables.find((t) => t.id === reservation.tableId)
                  return (
                    <Card key={reservation.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{reservation.customerName}</CardTitle>
                          {getReservationStatusBadge(reservation.status)}
                        </div>
                        <CardDescription>
                          {reservation.date} at {reservation.time} - {reservation.guests} guests
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-muted-foreground" />
                          <span>{table?.name || "Unknown Table"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.phone}</span>
                        </div>
                        {reservation.notes && (
                          <div className="text-sm text-muted-foreground">Notes: {reservation.notes}</div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button size="sm">Check In</Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

