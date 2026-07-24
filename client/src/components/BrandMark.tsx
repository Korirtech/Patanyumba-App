import { Home, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

/**
 * A lightweight local brand mark that remains available in standalone builds.
 * It combines a home silhouette and location pin, reflecting PataNyumba's
 * purpose without depending on project-hosted image storage.
 */
export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm",
        className
      )}
    >
      <Home className="h-[62%] w-[62%] translate-y-0.5" strokeWidth={2.5} />
      <MapPin
        className="absolute right-[7%] top-[6%] h-[38%] w-[38%] fill-secondary text-secondary"
        strokeWidth={2.5}
      />
    </span>
  );
}
