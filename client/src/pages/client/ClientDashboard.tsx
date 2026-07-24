import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Heart,
  Search,
  Home,
  MapPin,
  Bed,
  Bath,
  MessageCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import {
  getUserFavorites,
  getApprovedProperties,
  formatCurrency,
  getSettings,
} from "@/lib/store";
import type { Property } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/client/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/client/favorites", label: "Saved Homes", icon: navIcons.favorites },
  { href: "/properties", label: "Browse All", icon: navIcons.search },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const settings = getSettings();

  const favorites: Property[] = user ? getUserFavorites(user.id) : [];
  const allApproved = getApprovedProperties();

  // Recommended: just show a few approved properties not in favorites
  const favIds = new Set(favorites.map((f) => f.id));
  const recommended = allApproved.filter((p) => !favIds.has(p.id)).slice(0, 4);

  const activeTab =
    location === "/client/favorites" ? "favorites" : "overview";

  return (
    <DashboardLayout navItems={navItems} title="My Dashboard" activePath={location}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Saved Homes" value={favorites.length} icon={<Heart className="h-6 w-6" />} color="rose" />
            <StatCard label="Available Properties" value={allApproved.length} icon={<Home className="h-6 w-6" />} color="teal" />
            <StatCard label="Counties" value={new Set(allApproved.map((p) => p.county)).size} icon={<MapPin className="h-6 w-6" />} color="blue" />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="/properties">
              <Button className="gap-2">
                <Search className="h-4 w-4" /> Browse Properties
              </Button>
            </Link>
            <Link href="/client/favorites">
              <Button variant="outline" className="gap-2">
                <Heart className="h-4 w-4" /> View Saved Homes
              </Button>
            </Link>
          </div>

          {/* Saved homes preview */}
          {favorites.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display font-bold">Saved Homes</h3>
                <Link href="/client/favorites">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {favorites.slice(0, 3).map((p) => {
                  const img = p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&h=60&fit=crop";
                  const whatsappLink = `https://wa.me/254726605919?text=${encodeURIComponent(`Hello, I'm interested in: ${p.title} — ${p.county}, ${p.town}`)}`;
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                      <img
                        src={img}
                        alt={p.title}
                        className="h-14 w-20 rounded-lg object-cover shrink-0 bg-muted"
                        onError={(e) => ((e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&h=60&fit=crop")}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.county}, {p.town}
                        </p>
                        <p className="text-sm font-semibold text-primary tabular-nums mt-0.5">
                          {formatCurrency(p.price, settings.currency)}/mo
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/property/${p.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">View</Button>
                        </Link>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Recommended For You
                </h3>
                <Link href="/properties">
                  <Button variant="ghost" size="sm">Browse All</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                {recommended.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}

          {favorites.length === 0 && recommended.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Start browsing to find your next home.</p>
              <Link href="/properties">
                <Button className="mt-4 gap-2">
                  <Search className="h-4 w-4" /> Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Saved Homes</h2>
            <span className="text-sm text-muted-foreground">{favorites.length} saved</span>
          </div>
          {favorites.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">You haven't saved any properties yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap the heart icon on any property to save it here.
              </p>
              <Link href="/properties">
                <Button className="mt-4 gap-2">
                  <Search className="h-4 w-4" /> Browse Properties
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
