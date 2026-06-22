import { LucideIcon } from "lucide-react";

export function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string | number; icon: LucideIcon; trend?: string }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-11 w-11 grid place-items-center rounded-xl bg-sage-50 text-sage-600"><Icon className="h-5 w-5" /></div>
        {trend && <span className="text-xs text-green-600 font-medium">{trend}</span>}
      </div>
      <p className="text-2xl font-semibold mt-4">{value}</p>
      <p className="text-sm text-stone-500">{title}</p>
    </div>
  );
}