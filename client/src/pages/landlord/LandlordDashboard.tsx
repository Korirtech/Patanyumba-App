import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import SafeImage from "@/components/SafeImage";
import {
  Home, Eye, MessageCircle, PlusCircle, Trash2, CheckCircle, Clock,
  XCircle, EyeOff, Loader2, Edit, TrendingUp, RefreshCw, ArrowRight,
} from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getSettings } from "@/lib/store";
import {
  getMyProperties as getMyPropertiesApi,
  deleteMyProperty as deleteMyPropertyApi,
  updateMyProperty as updateMyPropertyApi,
} from "@/lib/api";
import type { Property } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/landlord/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/landlord/add", label: "Add Property", icon: navIcons.add },
  { href: "/landlord/properties", label: "My Properties", icon: navIcons.properties },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  approved: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  rejected: "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  hidden: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  hidden: <EyeOff className="h-3.5 w-3.5" />,
};

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const settings = getSettings();

  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPropertiesApi();
      if (result.error) { toast.error(result.error); return; }
      setMyProperties((result.data || []) as unknown as Property[]);
    } catch {
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProperties();
  }, [user, refreshKey, fetchProperties]);

  const stats = useMemo(() => ({
    total: myProperties.length,
    approved: myProperties.filter((p) => p.status === "approved").length,
    totalViews: myProperties.reduce((sum, p) => sum + (p.views || 0), 0),
    totalWhatsApp: myProperties.reduce((sum, p) => sum + (p.whatsappClicks || 0), 0),
  }), [myProperties]);

  const deleteProperty = async (id: string) => {
    const result = await deleteMyPropertyApi(id);
    if (result.error) { toast.error(result.error); return; }
    setMyProperties((prev) => prev.filter((p) => p.id !== id));
    toast.success("Property deleted.");
  };

  const toggleHide = async (id: string) => {
    const property = myProperties.find((p) => p.id === id);
    if (!property) return;
    const newStatus = property.status === "hidden" ? "approved" : "hidden";
    const result = await updateMyPropertyApi(id, { status: newStatus });
    if (result.error) { toast.error(result.error); return; }
    setMyProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus as Property["status"] } : p))
    );
    toast.success("Property visibility updated.");
  };

  const activeTab = location === "/landlord/properties" ? "properties" : "overview";

  return (
    <DashboardLayout navItems={navItems} title="Landlord Dashboard" activePath={location}>

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Welcome */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold">
                Welcome back, {user?.name?.split(" ")[0] || "Landlord"} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Here's an overview of your property listings.
              </p>
            </div>
            <Link href="/landlord/add">
              <Button className="gap-2 rounded-xl shadow-sm shadow-primary/20">
                <PlusCircle className="h-4 w-4" /> Add Property
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="My Properties" value={stats.total} icon={<Home className="h-6 w-6" />} color="teal" />
            <StatCard label="Approved" value={stats.approved} icon={<CheckCircle className="h-6 w-6" />} color="blue" />
            <StatCard label="Total Views" value={stats.totalViews} icon={<Eye className="h-6 w-6" />} color="amber" />
            <StatCard label="WhatsApp Clicks" value={stats.totalWhatsApp} icon={<MessageCircle className="h-6 w-6" />} color="teal" />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                href: "/landlord/add",
                icon: PlusCircle,
                title: "Add New Property",
                desc: "List a new rental property",
                color: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                href: "/landlord/properties",
                icon: Home,
                title: "Manage Listings",
                desc: "Edit, hide, or delete properties",
                color: "bg-blue-500/10",
                iconColor: "text-blue-600",
              },
              {
                href: "/properties",
                icon: TrendingUp,
                title: "View Marketplace",
                desc: "See how your listings appear",
                color: "bg-emerald-500/10",
                iconColor: "text-emerald-600",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-110", item.color)}>
                    <item.icon className={cn("h-5 w-5", item.iconColor)} />
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

          {/* Recent listings */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold">Recent Listings</h3>
              <Link href="/landlord/properties">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs">View All</Button>
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your properties...</p>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Home className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground text-sm mb-5">You haven't listed any properties yet. Get started today!</p>
                <Link href="/landlord/add">
                  <Button className="gap-2 rounded-xl">
                    <PlusCircle className="h-4 w-4" /> Add Your First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myProperties.slice(0, 5).map((p) => {
                  const img = p.images?.[0] || "";
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                      <SafeImage
                        src={img}
                        alt={p.title}
                        className="h-14 w-20 rounded-xl object-cover shrink-0"
                        wrapperClassName="h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.county}, {p.town} · {formatCurrency(p.price, settings.currency)}/mo</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views || 0} views</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.whatsappClicks || 0} chats</span>
                        </div>
                      </div>
                      <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0", statusStyles[p.status])}>
                        {statusIcons[p.status]} {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Properties Tab ───────────────────────────────────────────── */}
      {activeTab === "properties" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold">My Properties</h1>
              <p className="text-muted-foreground text-sm mt-1">{myProperties.length} total listings</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setRefreshKey(k => k + 1)} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Link href="/landlord/add">
                <Button className="gap-2 rounded-xl shadow-sm shadow-primary/20">
                  <PlusCircle className="h-4 w-4" /> Add Property
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your properties...</p>
            </div>
          ) : myProperties.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground text-sm mb-5">Start listing your properties to reach potential tenants.</p>
              <Link href="/landlord/add">
                <Button className="gap-2 rounded-xl">
                  <PlusCircle className="h-4 w-4" /> Add Your First Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider w-16">Photo</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Property</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Listed</th>
                      <th className="px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myProperties.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <SafeImage
                            src={p.images?.[0]}
                            alt={p.title}
                            className="h-12 w-16 rounded-xl object-cover"
                            wrapperClassName="h-12 w-16 shrink-0 rounded-xl overflow-hidden bg-muted"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.type} · {p.bedrooms}bd/{p.bathrooms}ba</p>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{p.county}, {p.town}</td>
                        <td className="px-4 py-3.5 font-semibold tabular-nums whitespace-nowrap">
                          {formatCurrency(p.price, settings.currency)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("flex items-center gap-1 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[p.status])}>
                            {statusIcons[p.status]} {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" /> {p.views || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <Link href={`/property/${p.id}`}>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-lg">
                                <Eye className="h-3.5 w-3.5" /> View
                              </Button>
                            </Link>
                            <Link href={`/landlord/properties/${p.id}/edit`}>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-lg">
                                <Edit className="h-3.5 w-3.5" /> Edit
                              </Button>
                            </Link>
                            {p.status === "approved" && (
                              <Button size="sm" variant="outline" onClick={() => toggleHide(p.id)} className="gap-1.5 text-xs rounded-lg">
                                <EyeOff className="h-3.5 w-3.5" /> Hide
                              </Button>
                            )}
                            {p.status === "hidden" && (
                              <Button size="sm" variant="outline" onClick={() => toggleHide(p.id)} className="gap-1.5 text-xs rounded-lg">
                                <Eye className="h-3.5 w-3.5" /> Unhide
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => deleteProperty(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
