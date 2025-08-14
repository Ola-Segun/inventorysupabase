"use client"

import { useRef } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

export function SellerCategoryChart() {
  const chartRef = useRef<ChartJS>(null)

  // Data for the chart
  const data = {
    labels: ["Grocery", "Meat", "Dairy", "Bakery", "Beverages", "Household"],
    datasets: [
      {
        data: [42, 24, 13, 9, 7, 5],
        backgroundColor: [
          "hsl(142, 76%, 36%)", // Green for Grocery
          "hsl(0, 79%, 63%)", // Red for Meat
          "hsl(214, 100%, 77%)", // Light Blue for Dairy
          "hsl(31, 100%, 71%)", // Orange for Bakery
          "hsl(262, 100%, 77%)", // Purple for Beverages
          "hsl(200, 18%, 46%)", // Gray for Household
        ],
        borderColor: [
          "hsl(142, 76%, 36% / 0.8)",
          "hsl(0, 79%, 63% / 0.8)",
          "hsl(214, 100%, 77% / 0.8)",
          "hsl(31, 100%, 71% / 0.8)",
          "hsl(262, 100%, 77% / 0.8)",
          "hsl(200, 18%, 46% / 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  }

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
            return `${label}: ${percentage}% ($${Math.round(value * 245.69)})`
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Pie ref={chartRef} data={data} options={options} />
    </div>
  )
}

