import { Link } from "wouter";
import { Heart, Bed, Bath, MapPin, BadgeCheck, MessageCircle, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatCurrency, getSettings } from "@/lib/store";
import type { Property, PropertyStatus } from "@/lib/types";
import type { PropertyData } from "@/lib/api";
import SafeImage from "@/components/SafeImage";

const statusStyles: Record<PropertyStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
  rejected: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20",
  hidden: "bg-gray-500/15 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20",
};

const statusLabels: Record<PropertyStatus, string> = {
  pending: "Pending",
  approved: "Available",
  rejected: "Rejected",
  hidden: "Hidden",
};

export default function PropertyCard({ property }: { property: Property | PropertyData }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const settings = getSettings();
  const fav = user ? isFavorite(property.id) : false;
  const img = property.images?.[0] || "";

  const whatsappLink = `https://wa.me/254726605919?text=${encodeURIComponent(
    `Hello, I'm interested in your property listed on PataNyumba.\nProperty: ${property.title}\nLocation: ${property.county} ${property.town}\nPrice: ${formatCurrency(property.price, settings.currency)}\nCan I schedule a viewing?`
  )}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <SafeImage
          src={img}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          wrapperClassName="h-full w-full"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={cn("property-badge backdrop-blur-sm", statusStyles[property.status as PropertyStatus])}>
            {statusLabels[property.status as PropertyStatus]}
          </span>
          {property.verified && (
            <span className="property-badge bg-primary/90 text-primary-foreground backdrop-blur-sm">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {(property as any).featured && (
            <span className="property-badge badge-gold backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" /> Featured
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(property.id)}
          aria-label="Toggle favorite"
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-sm",
            fav
              ? "bg-rose-500 text-white shadow-rose-500/30"
              : "bg-white/90 text-rose-400 hover:scale-110 hover:bg-white hover:text-rose-500 dark:bg-black/50 dark:text-rose-400"
          )}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-current heart-bounce")} />
        </button>

        {/* Price overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-white font-display text-lg font-bold tabular-nums drop-shadow-md">
              {formatCurrency(property.price, settings.currency)}
              <span className="text-xs font-normal text-white/80">/mo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        {/* Price */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="font-display text-xl font-bold text-primary tabular-nums">
            {formatCurrency(property.price, settings.currency)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
          {property.type && (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
              {property.type}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground leading-snug line-clamp-1 mb-1">
          {property.title}
        </h3>

        <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          <span className="truncate">{property.county}, {property.town}</span>
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/60">
          <span className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-primary/70" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}</span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-primary/70" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}</span>
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full gap-1.5 rounded-xl font-medium"
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </Button>
          </Link>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
