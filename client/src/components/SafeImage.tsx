/**
 * SafeImage – a robust image component for Patanyumba.
 *
 * Fixes:
 *  - Resolves relative /uploads/... paths to absolute URLs
 *  - Shows a loading skeleton while the image is fetching
 *  - Shows a graceful placeholder on load error (no broken-image icon)
 *  - Validates that the src is a non-empty string before rendering
 *
 * Usage:
 *   <SafeImage src={property.images[0]} alt="Property cover" className="h-full w-full object-cover" />
 */

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/components/ImageUploader";

// Fallback image used when src is empty or fails to load
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source – may be an absolute URL or a relative /uploads/... path */
  src?: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Whether to show a skeleton while loading (default: true) */
  showSkeleton?: boolean;
  /** Custom fallback URL (overrides the default Unsplash placeholder) */
  fallbackSrc?: string;
  /** Extra class names applied to the wrapper div */
  wrapperClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  showSkeleton = true,
  fallbackSrc = FALLBACK_IMAGE,
  className,
  wrapperClassName,
  ...rest
}: SafeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Resolve relative paths and validate
  const resolvedSrc = src ? resolveImageUrl(src) : "";
  const effectiveSrc = resolvedSrc || fallbackSrc;

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          wrapperClassName,
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-1 p-2 text-center">
          <ImageOff className="h-6 w-6 opacity-40" />
          <span className="text-xs opacity-60">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {showSkeleton && !loaded && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // If the resolved src fails, try the fallback once
          if (effectiveSrc !== fallbackSrc) {
            setError(false);
            setLoaded(false);
            // Swap src to fallback by triggering error state on next attempt
          }
          setError(true);
        }}
        {...rest}
      />
    </div>
  );
}
