"use client"

import { useRef, useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface SalesChartProps {
  isHourly?: boolean
  startDate?: Date
  endDate?: Date
  comparison?: string
}

export function SalesChart({ isHourly = false, startDate, endDate, comparison = "none" }: SalesChartProps) {
  const chartRef = useRef<ChartJS>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate random sales data
  const generateSalesData = (count: number, min: number, max: number) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  }

  // Generate comparison data with a slight variation
  const generateComparisonData = (baseData: number[]) => {
    return baseData.map((value) => {
      const variation = Math.random() * 0.3 - 0.15 // -15% to +15%
      return Math.max(0, Math.round(value * (1 + variation)))
    })
  }

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let labels: string[] = []
      let interval = "daily"

      // If hourly data is requested
      if (isHourly) {
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      }
      // If date range is provided, generate appropriate labels
      else if (startDate && endDate) {
        const dayDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        // Choose appropriate interval based on date range
        if (dayDiff <= 31) {
          // Daily for up to a month
          interval = "daily"
          const days = eachDayOfInterval({ start: startDate, end: endDate })
          labels = days.map((day) => format(day, "MMM d"))
        } else if (dayDiff <= 90) {
          // Weekly for up to 3 months
          interval = "weekly"
          const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
          labels = weeks.map((week) => `Week of ${format(week, "MMM d")}`)
        } else {
          // Monthly for longer periods
          interval = "monthly"
          const months = eachMonthOfInterval({ start: startDate, end: endDate })
          labels = months.map((month) => format(month, "MMM yyyy"))
        }
      }
      // Default fallback
      else {
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      }

      // Generate appropriate min/max values based on interval type
      const getMinMax = () => {
        if (isHourly) return { min: 50, max: 200 }
        switch (interval) {
          case "daily":
            return { min: 500, max: 1500 }
          case "weekly":
            return { min: 3500, max: 10500 }
          case "monthly":
            return { min: 15000, max: 45000 }
          default:
            return { min: 500, max: 1500 }
        }
      }

      const { min, max } = getMinMax()
      const mainData = generateSalesData(labels.length, min, max)

      // Create the chart data
      const data = {
        labels,
        datasets: [
          {
            label: "Sales",
            data: mainData,
            borderColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      }

      // Add comparison data if requested
      if (comparison !== "none") {
        const comparisonLabel = comparison === "previous" ? "Previous Period" : "Last Year"
        data.datasets.push({
          label: comparisonLabel,
          data: generateComparisonData(mainData),
          borderColor: "hsl(var(--muted-foreground) / 0.5)",
          backgroundColor: "transparent",
          borderDashed: [5, 5],
          tension: 0.3,
          fill: false,
        })
      }

      setChartData(data)
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [isHourly, startDate, endDate, comparison])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border) / 0.2)",
        },
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading chart data...</span>
        </div>
      ) : (
        <Line ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  )
}

