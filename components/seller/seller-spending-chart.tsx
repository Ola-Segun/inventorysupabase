"use client"

import { useRef } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function SellerSpendingChart() {
  const chartRef = useRef<ChartJS>(null)

  // Generate random sales data
  const generateSpendingData = (count: number, min: number, max: number) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  }

  // Labels for the chart
  const labels = ["January", "February", "March", "April", "May", "June"]

  // Data for the chart
  const data = {
    labels,
    datasets: [
      {
        label: "Grocery",
        data: generateSpendingData(labels.length, 1000, 5000),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
      },
      {
        label: "Electronics",
        data: generateSpendingData(labels.length, 500, 3000),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
      {
        label: "Household",
        data: generateSpendingData(labels.length, 800, 2500),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
    ],
  }

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
    <div className="w-full h-full">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  )
}

