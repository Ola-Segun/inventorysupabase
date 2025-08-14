"use client"

import { useState } from "react"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, CheckCircle, Clock, XCircle, Percent, Gift, Tag, Activity } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

// Define discount types and status
type DiscountType = "percentage" | "fixed" | "bogo" | "free_item"
type DiscountStatus = "active" | "scheduled" | "expired" | "inactive"

// Sample discounts data
const discountsData = [
	{
		id: "DISC-001",
		name: "Summer Sale",
		type: "percentage" as DiscountType,
		value: "20%",
		code: "SUMMER20",
		startDate: "2023-04-01",
		endDate: "2023-06-30",
		status: "active" as DiscountStatus,
		usageCount: 124,
		applicableTo: "All Products",
	},
	{
		id: "DISC-002",
		name: "New Customer",
		type: "fixed" as DiscountType,
		value: "$10 off",
		code: "WELCOME10",
		startDate: "2023-01-01",
		endDate: "2023-12-31",
		status: "active" as DiscountStatus,
		usageCount: 87,
		applicableTo: "First Order",
	},
	{
		id: "DISC-003",
		name: "Holiday Special",
		type: "percentage" as DiscountType,
		value: "15%",
		code: "HOLIDAY15",
		startDate: "2023-11-20",
		endDate: "2023-12-26",
		status: "scheduled" as DiscountStatus,
		usageCount: 0,
		applicableTo: "Selected Categories",
	},
	{
		id: "DISC-004",
		name: "Buy One Get One",
		type: "bogo" as DiscountType,
		value: "Buy 1 Get 1 Free",
		code: "BOGO2023",
		startDate: "2023-03-15",
		endDate: "2023-03-30",
		status: "expired" as DiscountStatus,
		usageCount: 56,
		applicableTo: "Selected Products",
	},
	{
		id: "DISC-005",
		name: "Loyalty Reward",
		type: "percentage" as DiscountType,
		value: "10%",
		code: "LOYAL10",
		startDate: "2023-01-01",
		endDate: "2023-12-31",
		status: "active" as DiscountStatus,
		usageCount: 212,
		applicableTo: "All Products",
	},
	{
		id: "DISC-006",
		name: "Free Dessert",
		type: "free_item" as DiscountType,
		value: "Free Item",
		code: "FREEDESSERT",
		startDate: "2023-04-20",
		endDate: "2023-05-20",
		status: "active" as DiscountStatus,
		usageCount: 43,
		applicableTo: "With Purchase Over $30",
	},
	{
		id: "DISC-007",
		name: "Flash Sale",
		type: "percentage" as DiscountType,
		value: "30%",
		code: "FLASH30",
		startDate: "2023-02-14",
		endDate: "2023-02-14",
		status: "expired" as DiscountStatus,
		usageCount: 98,
		applicableTo: "All Products",
	},
	{
		id: "DISC-008",
		name: "Weekend Deal",
		type: "fixed" as DiscountType,
		value: "$5 off",
		code: "WEEKEND5",
		startDate: "2023-04-21",
		endDate: "2023-09-30",
		status: "inactive" as DiscountStatus,
		usageCount: 0,
		applicableTo: "Orders Over $50",
	},
]

export function DiscountsTable() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [typeFilter, setTypeFilter] = useState<string>("all")
	const [discounts, setDiscounts] = useState(discountsData)
	const [isAddOpen, setIsAddOpen] = useState(false)
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")
	const [newDiscount, setNewDiscount] = useState({
		name: "",
		type: "percentage" as DiscountType,
		value: "",
		code: "",
		startDate: "",
		endDate: "",
		status: "active" as DiscountStatus,
		usageCount: 0,
		applicableTo: "",
		description: "",
	})
	const { toast } = useToast()

	// Date filter logic
	const isWithinDateRange = (discount: any) => {
		if (!dateFrom && !dateTo) return true
		const start = new Date(discount.startDate)
		const end = new Date(discount.endDate)
		const from = dateFrom ? new Date(dateFrom) : null
		const to = dateTo ? new Date(dateTo) : null
		if (from && end < from) return false
		if (to && start > to) return false
		return true
	}

	// Filter discounts based on search term, status filter, type filter, and date range
	const filteredDiscounts = discounts.filter((discount) => {
		const matchesSearch =
			discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			discount.code.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesStatus = statusFilter === "all" || discount.status === statusFilter
		const matchesType = typeFilter === "all" || discount.type === typeFilter
		const matchesDate = isWithinDateRange(discount)

		return matchesSearch && matchesStatus && matchesType && matchesDate
	})

	// Function to get discount type icon
	const getDiscountTypeIcon = (type: DiscountType) => {
		switch (type) {
			case "percentage":
				return <Percent className="h-4 w-4 text-indigo-500" />
			case "fixed":
				return <Tag className="h-4 w-4 text-green-500" />
			case "bogo":
				return <Gift className="h-4 w-4 text-amber-500" />
			case "free_item":
				return <Gift className="h-4 w-4 text-pink-500" />
			default:
				return <Activity className="h-4 w-4" />
		}
	}

	// Function to get status badge
	const getStatusBadge = (status: DiscountStatus) => {
		switch (status) {
			case "active":
				return (
					<Badge className="bg-green-100 text-green-800 hover:bg-green-200">
						<CheckCircle className="h-3 w-3 mr-1" /> Active
					</Badge>
				)
			case "scheduled":
				return (
					<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
						<Clock className="h-3 w-3 mr-1" /> Scheduled
					</Badge>
				)
			case "expired":
				return (
					<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
						<XCircle className="h-3 w-3 mr-1" /> Expired
					</Badge>
				)
			case "inactive":
				return (
					<Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
						<XCircle className="h-3 w-3 mr-1" /> Inactive
					</Badge>
				)
			default:
				return <Badge variant="outline">Unknown</Badge>
		}
	}

	// Add new discount handler
	const handleAddDiscount = () => {
		if (!newDiscount.name || !newDiscount.value || !newDiscount.code || !newDiscount.startDate || !newDiscount.endDate) {
			toast({
				title: "Missing required fields",
				description: "Please fill in all required fields.",
				variant: "destructive",
			})
			return
		}
		setDiscounts([
			{
				...newDiscount,
				id: `DISC-${Math.floor(Math.random() * 10000)}`,
				usageCount: 0,
			},
			...discounts,
		])
		setIsAddOpen(false)
		setNewDiscount({
			name: "",
			type: "percentage",
			value: "",
			code: "",
			startDate: "",
			endDate: "",
			status: "active",
			usageCount: 0,
			applicableTo: "",
			description: "",
		})
		toast({
			title: "Discount added",
			description: "The new discount has been added.",
		})
	}

	// Edit discount handler (simple inline dialog for demonstration)
	const [editDiscount, setEditDiscount] = useState<any | null>(null)
	const handleEditDiscount = (discount: any) => setEditDiscount({ ...discount })
	const handleSaveEditDiscount = () => {
		setDiscounts(discounts.map(d => d.id === editDiscount.id ? editDiscount : d))
		setEditDiscount(null)
		toast({ title: "Discount updated", description: "Discount details updated." })
	}

	// Delete discount handler
	const handleDeleteDiscount = (id: string) => {
		setDiscounts(discounts.filter(d => d.id !== id))
		toast({ title: "Discount deleted", description: "Discount has been removed." })
	}

	// Activate/Deactivate handler
	const handleToggleActive = (discount: any) => {
		setDiscounts(discounts.map(d =>
			d.id === discount.id
				? { ...d, status: d.status === "active" ? "inactive" : "active" }
				: d
		))
		toast({
			title: discount.status === "active" ? "Discount deactivated" : "Discount activated",
			description: `Discount "${discount.name}" is now ${discount.status === "active" ? "inactive" : "active"}.`
		})
	}

	// Random code generator
	const generateRandomCode = () => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		let code = ""
		for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
		setNewDiscount({ ...newDiscount, code })
	}

	return (
		<Card>
			<div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
				<div className="flex flex-wrap gap-2 flex-1">
					<Input
						placeholder="Search by name or code"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-xs"
					/>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="scheduled">Scheduled</SelectItem>
							<SelectItem value="expired">Expired</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="percentage">Percentage</SelectItem>
							<SelectItem value="fixed">Fixed Amount</SelectItem>
							<SelectItem value="bogo">Buy One Get One</SelectItem>
							<SelectItem value="free_item">Free Item</SelectItem>
						</SelectContent>
					</Select>
					{/* Date range filter */}
					{/* <Input
						type="date"
						value={dateFrom}
						onChange={e => setDateFrom(e.target.value)}
						className="w-[140px]"
						placeholder="From"
					/>
					<Input
						type="date"
						value={dateTo}
						onChange={e => setDateTo(e.target.value)}
						className="w-[140px]"
						placeholder="To"
					/> */}
				</div>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="ml-auto">
							+ New Discount
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Add New Discount</DialogTitle>
						</DialogHeader>
						<div className="grid gap-3 py-2">
							<Input
								placeholder="Discount Name"
								value={newDiscount.name}
								onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
							/>
							<div className="flex gap-2">
								<Select
									value={newDiscount.type}
									onValueChange={(val) => setNewDiscount({ ...newDiscount, type: val as DiscountType })}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="percentage">Percentage</SelectItem>
										<SelectItem value="fixed">Fixed Amount</SelectItem>
										<SelectItem value="bogo">Buy One Get One</SelectItem>
										<SelectItem value="free_item">Free Item</SelectItem>
									</SelectContent>
								</Select>
								<Input
									placeholder={newDiscount.type === "percentage" ? "e.g. 10%" : "e.g. $5 off"}
									value={newDiscount.value}
									onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
								/>
							</div>
							<div className="flex gap-2 items-center">
								<Input
									placeholder="Discount Code"
									value={newDiscount.code}
									onChange={(e) =>
										setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
									}
									maxLength={16}
								/>
								<Button type="button" variant="outline" size="sm" onClick={generateRandomCode}>
									Random
								</Button>
							</div>
							<div className="flex gap-2">
								<Input
									type="date"
									value={newDiscount.startDate}
									onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
									className="w-1/2"
									placeholder="Start Date"
								/>
								<Input
									type="date"
									value={newDiscount.endDate}
									onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
									className="w-1/2"
									placeholder="End Date"
								/>
							</div>
							<Input
								placeholder="Applicable To (e.g. All Products, First Order)"
								value={newDiscount.applicableTo}
								onChange={(e) => setNewDiscount({ ...newDiscount, applicableTo: e.target.value })}
							/>
							<Textarea
								placeholder="Description (optional)"
								value={newDiscount.description}
								onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
								rows={2}
							/>
							<Select
								value={newDiscount.status}
								onValueChange={(val) => setNewDiscount({ ...newDiscount, status: val as DiscountStatus })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="scheduled">Scheduled</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsAddOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleAddDiscount}>Add Discount</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Code</TableHead>
							<TableHead>Validity</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Usage</TableHead>
							<TableHead>Applicable To</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredDiscounts.length > 0 ? (
							filteredDiscounts.map((discount) => (
								<TableRow key={discount.id}>
									<TableCell className="font-medium">{discount.name}</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											{getDiscountTypeIcon(discount.type)}
											<span>{discount.value}</span>
										</div>
									</TableCell>
									<TableCell>
										<code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{discount.code}</code>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											<div>{discount.startDate}</div>
											<div>to</div>
											<div>{discount.endDate}</div>
										</div>
									</TableCell>
									<TableCell>{getStatusBadge(discount.status)}</TableCell>
									<TableCell>{discount.usageCount} uses</TableCell>
									<TableCell className="max-w-[150px] truncate" title={discount.applicableTo}>
										{discount.applicableTo}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleEditDiscount(discount)}>
													Edit Discount
												</DropdownMenuItem>
												<DropdownMenuItem>View Usage Report</DropdownMenuItem>
												{discount.status === "active" && (
													<DropdownMenuItem onClick={() => handleToggleActive(discount)}>
														Deactivate
													</DropdownMenuItem>
												)}
												{discount.status === "inactive" && (
													<DropdownMenuItem onClick={() => handleToggleActive(discount)}>
														Activate
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													className="text-red-600"
													onClick={() => handleDeleteDiscount(discount.id)}
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={8} className="text-center py-6">
									No discounts found matching your filters.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Discount Dialog */}
			{editDiscount && (
				<Dialog open={!!editDiscount} onOpenChange={() => setEditDiscount(null)}>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Edit Discount</DialogTitle>
						</DialogHeader>
						<div className="grid gap-3 py-2">
							<Input
								placeholder="Discount Name"
								value={editDiscount.name}
								onChange={(e) => setEditDiscount({ ...editDiscount, name: e.target.value })}
							/>
							<div className="flex gap-2">
								<Select
									value={editDiscount.type}
									onValueChange={(val) => setEditDiscount({ ...editDiscount, type: val as DiscountType })}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="percentage">Percentage</SelectItem>
										<SelectItem value="fixed">Fixed Amount</SelectItem>
										<SelectItem value="bogo">Buy One Get One</SelectItem>
										<SelectItem value="free_item">Free Item</SelectItem>
									</SelectContent>
								</Select>
								<Input
									placeholder={editDiscount.type === "percentage" ? "e.g. 10%" : "e.g. $5 off"}
									value={editDiscount.value}
									onChange={(e) => setEditDiscount({ ...editDiscount, value: e.target.value })}
								/>
							</div>
							<Input
								placeholder="Discount Code"
								value={editDiscount.code}
								onChange={(e) =>
									setEditDiscount({ ...editDiscount, code: e.target.value.toUpperCase() })
								}
								maxLength={16}
							/>
							<div className="flex gap-2">
								<Input
									type="date"
									value={editDiscount.startDate}
									onChange={(e) => setEditDiscount({ ...editDiscount, startDate: e.target.value })}
									className="w-1/2"
									placeholder="Start Date"
								/>
								<Input
									type="date"
									value={editDiscount.endDate}
									onChange={(e) => setEditDiscount({ ...editDiscount, endDate: e.target.value })}
									className="w-1/2"
									placeholder="End Date"
								/>
							</div>
							<Input
								placeholder="Applicable To (e.g. All Products, First Order)"
								value={editDiscount.applicableTo}
								onChange={(e) => setEditDiscount({ ...editDiscount, applicableTo: e.target.value })}
							/>
							<Textarea
								placeholder="Description (optional)"
								value={editDiscount.description}
								onChange={(e) => setEditDiscount({ ...editDiscount, description: e.target.value })}
								rows={2}
							/>
							<Select
								value={editDiscount.status}
								onValueChange={(val) => setEditDiscount({ ...editDiscount, status: val as DiscountStatus })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="scheduled">Scheduled</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setEditDiscount(null)}>
								Cancel
							</Button>
							<Button onClick={handleSaveEditDiscount}>Save Changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

