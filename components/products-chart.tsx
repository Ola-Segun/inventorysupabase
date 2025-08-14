"use client"

import { useRef, useEffect, useState } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface ProductsChartProps {
  startDate?: Date
  endDate?: Date
}

export function ProductsChart({ startDate, endDate }: ProductsChartProps) {
  const chartRef = useRef<ChartJS>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Generate slightly different data based on date range
      const getRandomizedData = () => {
        // Base data
        const baseData = [35, 20, 15, 20, 10]

        // If no date range, return base data
        if (!startDate || !endDate) return baseData

        // Add some randomization based on the date range
        const seed = startDate.getTime() + endDate.getTime()
        const random = (min: number, max: number) => {
          const x = Math.sin(seed) * 10000
          const r = x - Math.floor(x)
          return Math.floor(r * (max - min + 1)) + min
        }

        return baseData.map((value) => {
          const variation = random(-20, 20) / 100 // -20% to +20%
          return Math.max(5, Math.round(value * (1 + variation)))
        })
      }

      const data = {
        labels: ["Produce", "Bakery", "Dairy", "Meat", "Beverages"],
        datasets: [
          {
            data: getRandomizedData(),
            backgroundColor: [
              "hsl(142, 76%, 36%)", // Green for Produce
              "hsl(31, 100%, 71%)", // Orange for Bakery
              "hsl(214, 100%, 77%)", // Light Blue for Dairy
              "hsl(0, 79%, 63%)", // Red for Meat
              "hsl(262, 100%, 77%)", // Purple for Beverages
            ],
            borderColor: [
              "hsl(142, 76%, 36% / 0.8)",
              "hsl(31, 100%, 71% / 0.8)",
              "hsl(214, 100%, 77% / 0.8)",
              "hsl(0, 79%, 63% / 0.8)",
              "hsl(262, 100%, 77% / 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      }

      setChartData(data)
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [startDate, endDate])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 20,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${percentage}% ($${Math.round(value * 123.45)})`
          },
        },
      },
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
        <Pie ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  )
}

