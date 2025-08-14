"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 4500,
  },
  {
    name: "Feb",
    total: 3800,
  },
  {
    name: "Mar",
    total: 5000,
  },
  {
    name: "Apr",
    total: 4780,
  },
  {
    name: "May",
    total: 5890,
  },
  {
    name: "Jun",
    total: 6390,
  },
  {
    name: "Jul",
    total: 7490,
  },
  {
    name: "Aug",
    total: 7200,
  },
  {
    name: "Sep",
    total: 8200,
  },
  {
    name: "Oct",
    total: 8590,
  },
  {
    name: "Nov",
    total: 9100,
  },
  {
    name: "Dec",
    total: 9800,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

