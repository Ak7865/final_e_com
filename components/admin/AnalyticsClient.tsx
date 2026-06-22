"use client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#5b6b52", "#9caf88", "#c19a5b", "#d4af7a", "#7d9171", "#46533f"];

export function AnalyticsClient({ data }: { data: any }) {
  const revenueData = data.monthly.map((m: any) => ({ month: MONTHS[m._id - 1], revenue: m.revenue, orders: m.orders }));
  const catData = data.categoryRevenue.map((c: any) => ({ name: c._id, value: Math.round(c.revenue) }));
  const statusData = data.statusDist.map((s: any) => ({ name: s._id.replace(/_/g, " "), count: s.count }));

  const exportReport = () => {
    const rows = ["Month,Revenue,Orders", ...revenueData.map((r: any) => `${r.month},${r.revenue},${r.orders}`)].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "revenue-report.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl">Analytics</h1>
        <Button variant="outline" size="sm" onClick={exportReport}><Download className="h-4 w-4" /> Export Report</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#5b6b52" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Orders by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Bar dataKey="count" fill="#9caf88" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue by Category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Selling Products">
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-sage-100 text-sage-600 grid place-items-center text-sm font-medium">{i + 1}</span>
                <div className="flex-1"><p className="text-sm font-medium line-clamp-1">{p.name}</p><p className="text-xs text-stone-400">{p.soldCount} sold · ⭐ {p.rating?.toFixed(1)}</p></div>
                <span className="text-sm font-medium">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
const Card = ({ title, children }: any) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm"><h3 className="font-medium mb-4">{title}</h3>{children}</div>
);