import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Heart, Home, MessageCircle, Loader2, Search, ArrowRight, Sparkles } from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import PropertyCard from "@/components/PropertyCard";
import StatCard from "@/components/StatCard";
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

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const result = await getAllProperties();
      if (!result.error) setProperties(result.data || []);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Client Dashboard" activePath={location}>

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 md:p-8">
            <div className="absolute inset-0 hero-pattern opacity-20" />
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 blur-2xl -translate-y-1/3 translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-white/70" />
                <span className="text-sm text-white/70">Welcome back</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-white mb-1">
                {user?.name?.split(" ")[0] || "Explorer"} 👋
              </h1>
              <p className="text-white/60 text-sm">
                Discover your perfect home from {properties.length} verified listings.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/properties">
                  <Button size="sm" className="bg-white text-primary hover:bg-white/90 gap-2 rounded-xl font-semibold shadow-sm">
                    <Search className="h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/client/favorites">
                  <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 rounded-xl">
                    <Heart className="h-4 w-4" />
                    My Favorites ({favorites.length})
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard
              label="Available Listings"
              value={properties.length}
              icon={<Home className="h-6 w-6" />}
              color="teal"
            />
            <StatCard
              label="My Favorites"
              value={favorites.length}
              icon={<Heart className="h-6 w-6" />}
              color="rose"
            />
            <StatCard
              label="Inquiries Sent"
              value={0}
              icon={<MessageCircle className="h-6 w-6" />}
              color="blue"
            />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                href: "/properties",
                icon: Search,
                title: "Browse All Properties",
                desc: "Explore all verified listings",
                color: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                href: "/counties",
                icon: Home,
                title: "Browse by County",
                desc: "Find properties in your county",
                color: "bg-blue-500/10",
                iconColor: "text-blue-600",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Latest Properties */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg">Latest Properties</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Recently added verified listings</p>
              </div>
              <Link href="/properties">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {properties.slice(0, 6).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Home className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground text-sm">Check back soon for new listings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Favorites Tab ────────────────────────────────────────────── */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-extrabold">My Favorites</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="gap-2 rounded-xl">
                <Search className="h-4 w-4" /> Browse More
              </Button>
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 mb-4">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">No Favorites Yet</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
                Browse properties and click the heart icon to save them here for easy access.
              </p>
              <Link href="/properties">
                <Button className="gap-2 rounded-xl">
                  <Search className="h-4 w-4" /> Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
