import { Link } from "wouter";
import { Heart, Bed, Bath, MapPin, BadgeCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatCurrency, getSettings } from "@/lib/store";
import type { Property, PropertyStatus } from "@/lib/types";
import type { PropertyData } from "@/lib/api";
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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <SafeImage
          src={img}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
          wrapperClassName="h-full w-full"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusStyles[property.status as PropertyStatus])}>
            {statusLabels[property.status as PropertyStatus]}
          </span>
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <button
          onClick={() => toggleFavorite(property.id)}
          aria-label="Toggle favorite"
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
            fav
              ? "bg-rose-500 text-white"
              : "bg-white/85 text-rose-500 hover:scale-110 hover:bg-white"
          )}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-current heart-bounce")} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-lg font-bold text-primary tabular-nums">
            {formatCurrency(property.price, settings.currency)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
        <h3 className="mt-1 truncate font-semibold text-foreground">{property.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {property.county}, {property.town}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-primary" /> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-primary" /> {property.bathrooms} bath
          </span>
          <span className="text-muted-foreground">{property.type}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link href={`/property/${property.id}`}>
            <Button size="sm" className="flex-1">
              View Details
            </Button>
          </Link>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
