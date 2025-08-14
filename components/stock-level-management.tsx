"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, Pie, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js"
import { Badge } from "@/components/ui/badge"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title)

interface StockItem {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  unit: string
}

const stockData: StockItem[] = [
  { id: "PRD-001", name: "Organic Apples", category: "Produce", stock: 45, minStock: 10, unit: "kg" },
  { id: "PRD-002", name: "Whole Wheat Bread", category: "Bakery", stock: 12, minStock: 10, unit: "loaf" },
  { id: "PRD-003", name: "Organic Milk", category: "Dairy", stock: 4, minStock: 10, unit: "gallon" },
  { id: "PRD-004", name: "Chicken Breast", category: "Meat", stock: 0, minStock: 10, unit: "kg" },
  { id: "PRD-005", name: "Sparkling Water", category: "Beverages", stock: 36, minStock: 10, unit: "bottle" },
  { id: "PRD-006", name: "Chocolate Cake", category: "Bakery", stock: 0, minStock: 5, unit: "piece" },
  { id: "PRD-007", name: "Fresh Strawberries", category: "Produce", stock: 5, minStock: 10, unit: "kg" },
  { id: "PRD-008", name: "Cheddar Cheese", category: "Dairy", stock: 18, minStock: 10, unit: "kg" },
  { id: "PRD-009", name: "Ground Beef", category: "Meat", stock: 15, minStock: 10, unit: "kg" },
  { id: "PRD-010", name: "Orange Juice", category: "Beverages", stock: 24, minStock: 10, unit: "bottle" },
]

const chartTypes = [
  { label: "Bar Chart", value: "bar" },
  { label: "Pie Chart", value: "pie" },
  { label: "Line Chart", value: "line" },
]

export function StockLevelManagement() {
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar")
  const [category, setCategory] = useState<string>("all")

  // Category filter options
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(stockData.map((item) => item.category)))],
    []
  )

  // Filtered data
  const filtered = useMemo(
    () =>
      category === "all"
        ? stockData
        : stockData.filter((item) => item.category === category),
    [category]
  )

  // Stock status breakdown
  const stockStatus = useMemo(() => {
    let inStock = 0,
      lowStock = 0,
      outStock = 0
    for (const item of filtered) {
      if (item.stock === 0) outStock++
      else if (item.stock < item.minStock) lowStock++
      else inStock++
    }
    return { inStock, lowStock, outStock, total: filtered.length }
  }, [filtered])

  // Chart data for Bar/Line
  const barLineData = useMemo(() => {
    return {
      labels: filtered.map((item) => item.name),
      datasets: [
        {
          label: "Current Stock",
          data: filtered.map((item) => item.stock),
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Minimum Stock",
          data: filtered.map((item) => item.minStock),
          backgroundColor: "rgba(251, 191, 36, 0.7)",
          borderColor: "rgba(251, 191, 36, 1)",
          borderWidth: 1,
        },
      ],
    }
  }, [filtered])

  // Chart data for Pie
  const pieData = useMemo(() => {
    return {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [
        {
          label: "Stock Status",
          data: [stockStatus.inStock, stockStatus.lowStock, stockStatus.outStock],
          backgroundColor: [
            "rgba(34,197,94,0.7)",
            "rgba(251,191,36,0.7)",
            "rgba(239,68,68,0.7)",
          ],
          borderColor: [
            "rgba(34,197,94,1)",
            "rgba(251,191,36,1)",
            "rgba(239,68,68,1)",
          ],
          borderWidth: 2,
        },
      ],
    }
  }, [stockStatus])

  // Chart options
  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text:
          chartType === "pie"
            ? "Stock Status Distribution"
            : "Stock Level Analysis",
      },
      tooltip: { enabled: true },
    },
    scales: chartType !== "pie"
      ? {
          x: { title: { display: true, text: "Product" } },
          y: { title: { display: true, text: "Stock" }, beginAtZero: true },
        }
      : undefined,
  }

  // Summary info
  const totalStock = filtered.reduce((sum, item) => sum + item.stock, 0)
  const totalMinStock = filtered.reduce((sum, item) => sum + item.minStock, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Analysis</CardTitle>
        </CardHeader>
        <CardContent className="w-full grid">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={chartType} onValueChange={val => setChartType(val as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 items-center ml-auto">
              <Badge className="bg-green-500">In Stock: {stockStatus.inStock}</Badge>
              <Badge className="bg-amber-500">Low: {stockStatus.lowStock}</Badge>
              <Badge className="bg-red-500">Out: {stockStatus.outStock}</Badge>
              <Badge variant="outline">Total: {stockStatus.total}</Badge>
            </div>
          </div>
          <div className="min-h-[320px] max-h-[100vh] justify-center flex">
            {chartType === "bar" && <Bar data={barLineData} options={chartOptions} />}
            {chartType === "line" && <Line data={barLineData} options={chartOptions} />}
            {chartType === "pie" && <Pie data={pieData} options={chartOptions} />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Total Stock:</span> {totalStock} &nbsp;|&nbsp;
              <span className="font-medium">Total Minimum Required:</span> {totalMinStock}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Units: {filtered.map(i => i.unit).join(", ")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
 