import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import {
  Home,
  Eye,
  MessageCircle,
  TrendingUp,
  PlusCircle,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  EyeOff,
  Loader2,
} from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  getSettings,
} from "@/lib/store";
import {
  getMyProperties as getMyPropertiesApi,
  deleteMyProperty as deleteMyPropertyApi,
  updateMyProperty as updateMyPropertyApi,
} from "@/lib/api";
import type { Property } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { href: "/landlord/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/landlord/add", label: "Add Property", icon: navIcons.add },
  { href: "/landlord/properties", label: "My Properties", icon: navIcons.properties },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  hidden: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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

  // Fetch properties from the backend API
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPropertiesApi();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setMyProperties(result.data || []);
    } catch (err) {
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user, refreshKey, fetchProperties]);

  const stats = useMemo(() => ({
    total: myProperties.length,
    approved: myProperties.filter((p) => p.status === "approved").length,
    totalViews: myProperties.reduce((sum, p) => sum + (p.views || 0), 0),
    totalWhatsApp: myProperties.reduce((sum, p) => sum + (p.whatsappClicks || 0), 0),
  }), [myProperties]);

  const deleteProperty = async (id: string) => {
    const result = await deleteMyPropertyApi(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setMyProperties((prev) => prev.filter((p) => p.id !== id));
    toast.success("Property deleted.");
  };

  const toggleHide = async (id: string) => {
    const property = myProperties.find((p) => p.id === id);
    if (!property) return;
    const newStatus = property.status === "hidden" ? "approved" : "hidden";
    const result = await updateMyPropertyApi(id, { status: newStatus });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setMyProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus as Property["status"] } : p))
    );
    toast.success("Property visibility updated.");
  };

  const activeTab =
    location === "/landlord/properties" ? "properties" : "overview";

  return (
    <DashboardLayout navItems={navItems} title="Landlord Dashboard" activePath={location}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="My Properties" value={stats.total} icon={<Home className="h-6 w-6" />} color="teal" />
            <StatCard label="Approved" value={stats.approved} icon={<CheckCircle className="h-6 w-6" />} color="blue" />
            <StatCard label="Total Views" value={stats.totalViews} icon={<Eye className="h-6 w-6" />} color="amber" />
            <StatCard label="WhatsApp Clicks" value={stats.totalWhatsApp} icon={<MessageCircle className="h-6 w-6" />} color="teal" />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="/landlord/add">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add New Property
              </Button>
            </Link>
            <Link href="/landlord/properties">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" /> Manage Properties
              </Button>
            </Link>
          </div>

          {/* Recent listings */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display font-bold">Recent Listings</h3>
              <Link href="/landlord/properties">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : myProperties.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Home className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">You haven't listed any properties yet.</p>
                <Link href="/landlord/add">
                  <Button className="mt-4 gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Your First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myProperties.slice(0, 5).map((p) => {
                  const img = p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&h=60&fit=crop";
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
                        <p className="text-xs text-muted-foreground">{p.county}, {p.town} · {formatCurrency(p.price, settings.currency)}/mo</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.whatsappClicks || 0}</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status]}`}>
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

      {/* Properties Tab */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">My Properties</h2>
            <Link href="/landlord/add">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add Property
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myProperties.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">You haven't listed any properties yet.</p>
              <Link href="/landlord/add">
                <Button className="mt-4 gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Your First Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-semibold">Property</th>
                      <th className="px-4 py-3 text-left font-semibold">Location</th>
                      <th className="px-4 py-3 text-left font-semibold">Price</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Views</th>
                      <th className="px-4 py-3 text-left font-semibold">Listed</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myProperties.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.type} · {p.bedrooms}bd/{p.bathrooms}ba</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.county}, {p.town}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(p.price, settings.currency)}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status]}`}>
                            {statusIcons[p.status]} {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" /> {p.views || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link href={`/property/${p.id}`}>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Eye className="h-3.5 w-3.5" /> View
                              </Button>
                            </Link>
                            {p.status === "approved" && (
                              <Button size="sm" variant="outline" onClick={() => toggleHide(p.id)} className="gap-1.5 text-xs">
                                <EyeOff className="h-3.5 w-3.5" /> Hide
                              </Button>
                            )}
                            {p.status === "hidden" && (
                              <Button size="sm" variant="outline" onClick={() => toggleHide(p.id)} className="gap-1.5 text-xs">
                                <Eye className="h-3.5 w-3.5" /> Unhide
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => deleteProperty(p.id)} className="gap-1.5 text-xs border-rose-300 text-rose-600 hover:bg-rose-50">
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
