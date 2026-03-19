"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"

// Monthly revenue chart data
const monthlyRevenueData = [
  { month: "Sent", revenue: 280000000, plan: 300000000 },
  { month: "Okt", revenue: 310000000, plan: 300000000 },
  { month: "Noy", revenue: 295000000, plan: 350000000 },
  { month: "Dek", revenue: 340000000, plan: 350000000 },
  { month: "Yan", revenue: 325000000, plan: 500000000 },
  { month: "Fev", revenue: 180000000, plan: 500000000 },
]

// Payment method distribution
const paymentMethodData = [
  { name: "Bank", value: 45, color: "#3b82f6" },
  { name: "Click", value: 25, color: "#22c55e" },
  { name: "Payme", value: 15, color: "#f59e0b" },
  { name: "Naqd", value: 10, color: "#8b5cf6" },
  { name: "Boshqa", value: 5, color: "#6b7280" },
]

// Group statistics
const groupStatsData = [
  { name: "101-A", students: 32, paid: 28, debt: 4 },
  { name: "102-B", students: 28, paid: 25, debt: 3 },
  { name: "103-V", students: 30, paid: 22, debt: 8 },
  { name: "104-G", students: 35, paid: 30, debt: 5 },
  { name: "105-D", students: 25, paid: 20, debt: 5 },
]

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Oylik tushumlar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis
                className="text-xs"
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                name="Tushum"
              />
              <Area
                type="monotone"
                dataKey="plan"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.1}
                strokeDasharray="5 5"
                name="Reja"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentMethodsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">To'lov usullari taqsimoti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {paymentMethodData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function GroupStatsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Guruhlar statistikasi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupStatsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="students" name="Jami talabalar" fill="#3b82f6" />
              <Bar dataKey="paid" name="To'laganlar" fill="#22c55e" />
              <Bar dataKey="debt" name="Qarzdorlar" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}