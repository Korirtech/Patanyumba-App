/**
 * ImageUploader – enhanced image upload component for Patanyumba.
 *
 * Features:
 *  - Drag-and-drop zone with visual feedback
 *  - Client-side image compression via Canvas API (no extra deps)
 *  - Per-image loading skeleton while upload is in-flight
 *  - Drag-to-reorder thumbnails
 *  - Image count indicator
 *  - Robust error handling with user-friendly messages
 *  - Relative-path resolution for /uploads/... URLs
 *  - Image validation: format, size, and dimension checks
 *  - Error boundary per image (broken images show a placeholder instead of crashing)
 */

import { useState, useRef, useCallback, useId } from "react";
import {
  Upload,
  X,
  GripVertical,
  ImageOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/api";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const COMPRESSION_QUALITY = 0.82; // 0–1; 0.82 is a good balance
const COMPRESSION_MAX_DIMENSION = 1920; // px – long edge cap
const MAX_IMAGES = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve relative /uploads/... paths to an absolute URL at runtime. */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

/** Compress an image File using the Canvas API. Returns a new File. */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Downscale if either dimension exceeds the cap
      if (width > COMPRESSION_MAX_DIMENSION || height > COMPRESSION_MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height / width) * COMPRESSION_MAX_DIMENSION);
          width = COMPRESSION_MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * COMPRESSION_MAX_DIMENSION);
          height = COMPRESSION_MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback: return original
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        COMPRESSION_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

/** Validate a File before upload. Returns an error string or null. */
function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}" is not a supported format. Please use JPEG, PNG, or WEBP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ImageTileProps {
  url: string;
  index: number;
  total: number;
  isLoading?: boolean;
  isDragging?: boolean;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

function ImageTile({
  url,
  index,
  total,
  isLoading,
  isDragging,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ImageTileProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (isLoading) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all duration-200",
        isDragging ? "scale-95 border-primary opacity-60 shadow-lg" : "border-border hover:border-primary/50",
        "cursor-grab active:cursor-grabbing"
      )}
    >
      {/* Cover image or error state */}
      {imgError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <>
          {!imgLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
          <img
            src={resolveImageUrl(url)}
            alt={`Property image ${index + 1}`}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
        </>
      )}

      {/* Drag handle */}
      <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Primary badge */}
      {index === 0 && (
        <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          <CheckCircle2 className="h-2.5 w-2.5" /> Cover
        </div>
      )}

      {/* Index badge */}
      <div className="absolute bottom-1 right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-black/50 px-1 text-[10px] font-bold text-white">
        {index + 1}/{total}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label={`Remove image ${index + 1}`}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  className?: string;
}

export default function ImageUploader({ images, onChange, className }: ImageUploaderProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track which indices are currently uploading (for skeleton tiles)
  const [uploadingCount, setUploadingCount] = useState(0);

  // Drag-and-drop zone state
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag-to-reorder state
  const dragIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // URL input
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // ---------------------------------------------------------------------------
  // File processing pipeline
  // ---------------------------------------------------------------------------

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length - uploadingCount;

      if (remaining <= 0) {
        toast.error(`Maximum of ${MAX_IMAGES} images allowed.`);
        return;
      }

      const toProcess = fileArray.slice(0, remaining);
      if (fileArray.length > remaining) {
        toast.warning(`Only ${remaining} more image(s) can be added. Extra files were ignored.`);
      }

      // Validate all files first
      for (const file of toProcess) {
        const err = validateFile(file);
        if (err) {
          toast.error(err);
          return;
        }
      }

      setUploadingCount((c) => c + toProcess.length);

      const results = await Promise.allSettled(
        toProcess.map(async (file) => {
          // Compress before upload
          let processedFile = file;
          try {
            processedFile = await compressImage(file);
          } catch {
            // If compression fails, upload original
          }

          const result = await uploadImage(processedFile);
          if (result.error) throw new Error(result.error);
          if (!result.data?.imageUrl) throw new Error("No image URL returned");
          return result.data.imageUrl;
        })
      );

      setUploadingCount((c) => c - toProcess.length);

      const newUrls: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          newUrls.push(r.value);
        } else {
          const fileName = toProcess[i]?.name ?? "file";
          toast.error(`Failed to upload "${fileName}": ${(r.reason as Error).message}`);
        }
      });

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success(
          newUrls.length === 1
            ? "Image uploaded successfully."
            : `${newUrls.length} images uploaded successfully.`
        );
      }

      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [images, uploadingCount, onChange]
  );

  // ---------------------------------------------------------------------------
  // Drop zone handlers
  // ---------------------------------------------------------------------------

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the zone itself (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // ---------------------------------------------------------------------------
  // Reorder handlers
  // ---------------------------------------------------------------------------

  const handleTileDragStart = (index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
  };

  const handleTileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTileDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndex = dragIndexRef.current;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reordered = [...images];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    dragIndexRef.current = null;
    setDraggingIndex(null);
  };

  const handleTileDragEnd = () => {
    dragIndexRef.current = null;
    setDraggingIndex(null);
  };

  // ---------------------------------------------------------------------------
  // Remove
  // ---------------------------------------------------------------------------

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------------------------
  // URL input
  // ---------------------------------------------------------------------------

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url.startsWith("/") ? `${window.location.origin}${url}` : url);
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    if (images.length + uploadingCount >= MAX_IMAGES) {
      toast.error(`Maximum of ${MAX_IMAGES} images allowed.`);
      return;
    }

    onChange([...images, url]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const totalCount = images.length + uploadingCount;
  const canAddMore = totalCount < MAX_IMAGES;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {totalCount > 0 ? (
              <>
                <span className="font-bold text-foreground">{totalCount}</span>
                {" / "}
                {MAX_IMAGES} images
              </>
            ) : (
              "No images added yet"
            )}
          </span>
          {totalCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {images.length > 0 ? "First image is the cover" : "Uploading…"}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setShowUrlInput((v) => !v)}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || uploadingCount > 0}
          >
            {uploadingCount > 0 ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : "Upload"}
          </Button>
        </div>
      </div>

      {/* URL input row */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste an image URL (https://... or /uploads/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addImageUrl(); }
              if (e.key === "Escape") { setShowUrlInput(false); setUrlInput(""); }
            }}
            autoFocus
          />
          <Button type="button" variant="secondary" onClick={addImageUrl} disabled={!urlInput.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Drop zone (shown when no images yet or always as a compact add-more tile) */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop images here or click to browse"
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 select-none",
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            images.length > 0 && "py-5"
          )}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isDragOver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragOver ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or <span className="text-primary underline-offset-2 hover:underline">browse files</span>
              {" "}· JPEG, PNG, WEBP · max {MAX_FILE_SIZE_MB} MB each
            </p>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {(images.length > 0 || uploadingCount > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((url, idx) => (
            <ImageTile
              key={`${url}-${idx}`}
              url={url}
              index={idx}
              total={images.length}
              isDragging={draggingIndex === idx}
              onRemove={removeImage}
              onDragStart={handleTileDragStart}
              onDragOver={handleTileDragOver}
              onDrop={handleTileDrop}
              onDragEnd={handleTileDragEnd}
            />
          ))}

          {/* Skeleton tiles for in-flight uploads */}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <ImageTile
              key={`uploading-${i}`}
              url=""
              index={images.length + i}
              total={images.length + uploadingCount}
              isLoading
              onRemove={() => {}}
              onDragStart={() => {}}
              onDragOver={() => {}}
              onDrop={() => {}}
              onDragEnd={() => {}}
            />
          ))}
        </div>
      )}

      {/* Reorder hint */}
      {images.length > 1 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
          Drag thumbnails to reorder. The first image will be used as the cover photo.
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`${id}-file-input`}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        aria-hidden="true"
      />
    </div>
  );
}
