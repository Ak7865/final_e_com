"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function SalesChart({ data }: { data: { _id: number; total: number; orders: number }[] }) {
  const chartData = data.map((d) => ({ month: MONTHS[d._id - 1], revenue: d.total, orders: d.orders }));
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
      <h3 className="font-medium mb-4">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5b6b52" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#5b6b52" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#5b6b52" fill="url(#rev)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}