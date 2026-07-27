import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Heart, Home, MessageCircle, Loader2 } from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { getUserFavorites } from "@/lib/store";
import { getAllProperties } from "@/lib/api";
import type { PropertyData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/client/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/client/favorites", label: "Favorites", icon: navIcons.favorites },
];

export default function ClientDashboard() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const favorites = useMemo(() => getUserFavorites(user?.id || ""), [user?.id]);

  const activeTab = location === "/client/favorites" ? "favorites" : "overview";

  // Fetch properties from the backend API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const result = await getAllProperties();
      if (!result.error) {
        setProperties(result.data || []);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Client Dashboard" activePath={location}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-sm text-muted-foreground">Here's your personal dashboard overview.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{properties.length}</p>
                  <p className="text-xs text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{favorites.length}</p>
                  <p className="text-xs text-muted-foreground">Favorites</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">0</p>
                  <p className="text-xs text-muted-foreground">Inquiries Sent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Browse Properties */}
          <div>
            <h3 className="font-display font-semibold mb-4">Browse Properties</h3>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No properties available yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">My Favorites</h2>
            <p className="text-sm text-muted-foreground">Properties you've saved for later.</p>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No favorites yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse properties and click the heart icon to save them here.
              </p>
              <Link href="/properties">
                <Button className="mt-4 gap-2">
                  <Home className="h-4 w-4" /> Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
