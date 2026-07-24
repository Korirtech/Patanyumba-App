import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: "teal" | "blue" | "amber" | "rose";
}

const colorClasses = {
  teal: "bg-primary text-primary-foreground",
  blue: "bg-blue-600 text-white",
  amber: "bg-amber-500 text-white",
  rose: "bg-rose-500 text-white",
};

export default function StatCard({ label, value, icon, color = "teal" }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</p>
      </div>
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          colorClasses[color]
        )}
      >
        {icon}
      </div>
    </div>
  );
}
