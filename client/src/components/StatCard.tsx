import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: "teal" | "blue" | "amber" | "rose";
  trend?: { value: number; label: string };
}

const colorConfig = {
  teal: {
    icon: "stat-gradient-teal text-white shadow-sm shadow-primary/30",
    accent: "text-primary",
    bg: "bg-primary/5",
  },
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-500/30",
    accent: "text-blue-600",
    bg: "bg-blue-500/5",
  },
  amber: {
    icon: "stat-gradient-gold text-white shadow-sm shadow-amber-500/30",
    accent: "text-amber-600",
    bg: "bg-amber-500/5",
  },
  rose: {
    icon: "stat-gradient-rose text-white shadow-sm shadow-rose-500/30",
    accent: "text-rose-600",
    bg: "bg-rose-500/5",
  },
};

export default function StatCard({ label, value, icon, color = "teal", trend }: StatCardProps) {
  const config = colorConfig[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
      {/* Background accent */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", config.bg)} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {label}
          </p>
          <p className={cn("font-display text-3xl font-extrabold tabular-nums", config.accent)}>
            {value}
          </p>
          {trend && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              <span className={cn("font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            config.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
