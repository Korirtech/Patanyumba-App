import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  MapPin,
  Bed,
  Bath,
  Check,
  BadgeCheck,
  Heart,
  MessageCircle,
  Phone,
  CalendarCheck,
  ArrowLeft,
  Home as HomeIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  getUserById,
  formatCurrency,
  formatDate,
  getSettings,
} from "@/lib/store";
import { getPropertyDetail } from "@/lib/api";
import type { PropertyStatus } from "@/lib/types";
import type { PropertyData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SafeImage from "@/components/SafeImage";

const statusStyles: Record<PropertyStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  hidden: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusLabels: Record<PropertyStatus, string> = {
  pending: "Pending",
  approved: "Available",
  rejected: "Rejected",
  hidden: "Hidden",
};

// ── Loading skeleton ──────────────────────────────────────────────────
function PropertyDetailSkeleton() {
  return (
    <div className="container py-6 md:py-8 space-y-6 animate-pulse">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 aspect-[16/10] rounded-xl" />
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[16/10] rounded-lg" />
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImg, setActiveImg] = useState(0);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const settings = getSettings();

  // Fetch property from server on mount
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Property ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const result = await getPropertyDetail(id);
      if (result.error) {
        setError(result.error);
        setProperty(null);
      } else {
        setProperty(result.data || null);
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="container py-20 text-center">
        <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-bold">Property not found</h2>
        {error && (
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
        )}
        <Link href="/properties">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Button>
        </Link>
      </div>
    );
  }

  const landlord = getUserById(property.landlordId);
  const images = property.images?.length
    ? property.images
    : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"];
  const fav = user ? isFavorite(property.id) : false;

  const whatsappLink = `https://wa.me/254726605919?text=${encodeURIComponent(
    `Hello, I'm interested in your property listed on PataNyumba.\nProperty: ${property.title}\nLocation: ${property.county} ${property.town}\nPrice: ${formatCurrency(property.price, settings.currency)}\nCan I schedule a viewing?`
  )}`;

  const landlordWhatsapp = landlord
    ? `https://wa.me/${landlord.phone.replace(/^0/, "254")}?text=${encodeURIComponent(
        `Hello, I'm interested in ${property.title}`
      )}`
    : whatsappLink;

  const prevImage = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="page-enter container py-6 md:py-8">
      {/* Back link */}
      <Link href="/properties">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Button>
      </Link>

      {/* Title section */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.county}, {property.town}{property.estate ? `, ${property.estate}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusStyles[property.status as PropertyStatus])}>
            {statusLabels[property.status as PropertyStatus]}
          </span>
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Main image with navigation arrows */}
        <div className="relative lg:col-span-2 overflow-hidden rounded-xl bg-muted aspect-[16/10] group">
          <SafeImage
            src={images[activeImg] || images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-opacity duration-300"
            wrapperClassName="h-full w-full"
          />

          {/* Image counter */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" />
            {activeImg + 1} / {images.length}
          </div>

          {/* Navigation arrows (only when multiple images) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
          {images.slice(0, 4).map((img: string, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative overflow-hidden rounded-lg bg-muted aspect-[16/10] transition-all duration-200",
                activeImg === i
                  ? "ring-2 ring-primary ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <SafeImage
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                wrapperClassName="h-full w-full"
              />
              {/* "More" overlay on the last visible thumbnail when there are more images */}
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-sm">
                  +{images.length - 4} more
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dot indicators for mobile */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i === activeImg ? "w-5 bg-primary" : "w-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Info grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-display text-xl font-bold text-primary tabular-nums">
                {formatCurrency(property.price, settings.currency)}
              </p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Deposit</p>
              <p className="font-display text-lg font-bold tabular-nums">
                {formatCurrency(property.deposit || property.price * 2, settings.currency)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold">{property.type}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="font-semibold">{property.availability || "Available"}</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {(property.amenities?.length ? property.amenities : ["Water", "Parking", "Security"]).map((a: string) => (
                <span
                  key={a}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-primary" /> {a}
                </span>
              ))}
            </div>
          </div>

          {/* Property details table */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Property Details</h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Bedrooms</span>
                <span className="ml-auto font-semibold">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="ml-auto font-semibold">{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">County</span>
                <span className="ml-auto font-semibold">{property.county}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Town</span>
                <span className="ml-auto font-semibold">{property.town}</span>
              </div>
              {property.estate && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Estate</span>
                  <span className="ml-auto font-semibold">{property.estate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Listed</span>
                <span className="ml-auto font-semibold">{formatDate(property.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
                <MessageCircle className="h-5 w-5" />
                Chat via WhatsApp
              </Button>
            </a>
            <Button
              size="lg"
              variant="default"
              className="gap-2"
              onClick={() => toast.success("Viewing request sent! The landlord will contact you.")}
            >
              <CalendarCheck className="h-5 w-5" />
              Book Viewing
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => toggleFavorite(property.id)}
            >
              <Heart className={cn("h-5 w-5", fav && "fill-rose-500 text-rose-500")} />
              {fav ? "Saved" : "Save Property"}
            </Button>
          </div>
        </div>

        {/* Right: landlord card */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Landlord</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                {landlord?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{landlord?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0" /> {landlord?.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${landlord?.phone || ""}`} className="flex-1">
                <Button variant="outline" size="sm" className="gap-1.5 w-full">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
              <a href={landlordWhatsapp} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  size="sm"
                  className="gap-1.5 w-full bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-sm font-bold mb-3">Listing Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-semibold tabular-nums">{property.views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inquiries</span>
                <span className="font-semibold tabular-nums">{property.inquiries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WhatsApp Clicks</span>
                <span className="font-semibold tabular-nums">{property.whatsappClicks || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
