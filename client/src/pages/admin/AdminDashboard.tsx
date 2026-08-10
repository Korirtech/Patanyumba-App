import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Users, Home, CheckCircle, Clock, XCircle, Eye, Trash2, ShieldCheck, ShieldOff,
  BadgeCheck, BadgeX, Loader2, Star, StarOff, CalendarCheck, RefreshCw, TrendingUp,
} from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/store";
import {
  adminGetUsers, adminGetProperties, adminUpdateUser, adminDeleteUser,
  adminUpdateProperty, adminDeleteProperty,
  type UserData, type PropertyData, type SettingsData,
} from "@/lib/api";
import { toast } from "sonner";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const fmtCurrency = formatCurrency;
const fmtDate = formatDate;

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/admin/users", label: "Users", icon: navIcons.users },
  { href: "/admin/properties", label: "Properties", icon: navIcons.properties },
  { href: "/admin/settings", label: "Settings", icon: navIcons.settings },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
  hidden: "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
};

const availabilityBadge: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  Rented: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
  "Coming Soon": "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
};

const DEFAULT_SETTINGS: SettingsData = {
  currency: "KES",
  appName: "Patanyumba",
  logoUrl: "",
};

export default function AdminDashboard() {
  const [location] = useLocation();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const settings: SettingsData = DEFAULT_SETTINGS;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResult, propsResult] = await Promise.all([
        adminGetUsers(),
        adminGetProperties(),
      ]);
      if (!usersResult.error && usersResult.data) setUsers(usersResult.data);
      if (!propsResult.error && propsResult.data) setProperties(propsResult.data);
    } catch {
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalProperties: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    featured: properties.filter((p) => p.featured && p.availability !== "Rented").length,
  }), [users, properties]);

  const approveProperty = async (id: string) => {
    const result = await adminUpdateProperty(id, { status: "approved", verified: true });
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.map((p) => (p.id === id ? (result.data! as PropertyData) : p)));
    toast.success("Property approved and verified!");
  };

  const rejectProperty = async (id: string) => {
    const result = await adminUpdateProperty(id, { status: "rejected" });
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.map((p) => (p.id === id ? (result.data! as PropertyData) : p)));
    toast.success("Property rejected.");
  };

  const toggleFeatured = async (id: string) => {
    const current = properties.find((p) => p.id === id);
    if (!current) return;
    const newFeatured = !current.featured;
    const result = await adminUpdateProperty(id, { featured: newFeatured });
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.map((p) => (p.id === id ? (result.data! as PropertyData) : p)));
    toast.success(newFeatured ? "Property is now featured!" : "Property removed from featured.");
  };

  const markAsBooked = async (id: string) => {
    const result = await adminUpdateProperty(id, { availability: "Rented" });
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.map((p) => (p.id === id ? (result.data! as PropertyData) : p)));
    toast.success("Property marked as booked.");
  };

  const markAsAvailable = async (id: string) => {
    const result = await adminUpdateProperty(id, { availability: "Available" });
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.map((p) => (p.id === id ? (result.data! as PropertyData) : p)));
    toast.success("Property marked as available.");
  };

  const deleteProperty = async (id: string) => {
    const result = await adminDeleteProperty(id);
    if (result.error) { toast.error(result.error); return; }
    setProperties((prev) => prev.filter((p) => p.id !== id));
    toast.success("Property deleted.");
  };

  const toggleUserStatus = async (id: string) => {
    const current = users.find((u) => u.id === id);
    if (!current) return;
    const newStatus = current.status === "active" ? "suspended" : "active";
    const result = await adminUpdateUser(id, newStatus);
    if (result.error) { toast.error(result.error); return; }
    setUsers((prev) => prev.map((u) => (u.id === id ? (result.data! as UserData) : u)));
    toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}.`);
  };

  const deleteUser = async (id: string) => {
    const result = await adminDeleteUser(id);
    if (result.error) { toast.error(result.error); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted.");
  };

  const activeTab =
    location === "/admin/users" ? "users"
    : location === "/admin/properties" ? "properties"
    : "overview";

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Admin Dashboard" activePath={location}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard" activePath={location}>

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Page title */}
          <div>
            <h1 className="font-display text-2xl font-extrabold">Admin Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage users, properties, and platform settings.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} color="teal" />
            <StatCard label="Total Properties" value={stats.totalProperties} icon={<Home className="h-6 w-6" />} color="blue" />
            <StatCard label="Pending Review" value={stats.pending} icon={<Clock className="h-6 w-6" />} color="amber" />
            <StatCard label="Featured Live" value={stats.featured} icon={<Star className="h-6 w-6" />} color="teal" />
          </div>

          {/* Featured Properties Panel */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div>
                <h3 className="font-display font-bold">Featured Properties</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Displayed on the Home page. Mark as booked to remove.
                </p>
              </div>
              <Link href="/admin/properties">
                <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs">
                  Manage All <TrendingUp className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {properties.filter((p) => p.featured && p.availability !== "Rented").length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Star className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No featured properties. Go to <strong>Properties</strong> tab to feature a listing.
                  </p>
                </div>
              ) : (
                properties.filter((p) => p.featured && p.availability !== "Rented").map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4 hover:bg-muted/20 transition-colors">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.county}, {p.town} · {fmtCurrency(p.price, settings.currency)}/mo
                        {" · "}
                        <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-semibold", availabilityBadge[p.availability] ?? "")}>
                          {p.availability}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => markAsBooked(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                        <CalendarCheck className="h-3.5 w-3.5" /> Mark Booked
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleFeatured(p.id)} className="gap-1.5 text-xs rounded-lg text-muted-foreground hover:text-amber-600">
                        <StarOff className="h-3.5 w-3.5" /> Unfeature
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Properties */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div>
                <h3 className="font-display font-bold">Pending Approvals</h3>
                {stats.pending > 0 && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">{stats.pending} awaiting review</p>
                )}
              </div>
              <Link href="/admin/properties">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {properties.filter((p) => p.status === "pending").length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/40 mb-2" />
                  <p className="text-sm text-muted-foreground">All caught up! No pending properties.</p>
                </div>
              ) : (
                properties.filter((p) => p.status === "pending").slice(0, 5).map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.county}, {p.town} · {fmtCurrency(p.price, settings.currency)}/mo
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveProperty(p.id)} className="gap-1.5 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectProperty(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold">Recent Users</h3>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {users.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No users registered yet.</p>
                </div>
              ) : (
                users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-3 px-6 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email} · <span className="capitalize">{u.role}</span></p>
                    </div>
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                      u.status === "active"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                    )}>
                      {u.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold">All Users</h1>
              <p className="text-muted-foreground text-sm mt-1">{users.length} registered users</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span className="capitalize rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium border border-border">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                          )}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id)} className="gap-1.5 text-xs rounded-lg">
                              {u.status === "active" ? (
                                <><ShieldOff className="h-3.5 w-3.5" /> Suspend</>
                              ) : (
                                <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteUser(u.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Properties Tab ───────────────────────────────────────────── */}
      {activeTab === "properties" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold">All Properties</h1>
              <p className="text-muted-foreground text-sm mt-1">{properties.length} total properties</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Availability</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Verified</th>
                    <th className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wider">Featured</th>
                    <th className="px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No properties found.
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-medium truncate max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.type}</p>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{p.county}, {p.town}</td>
                        <td className="px-4 py-3.5 font-semibold tabular-nums whitespace-nowrap">
                          {fmtCurrency(p.price, settings.currency)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusBadge[p.status])}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", availabilityBadge[p.availability] ?? "bg-gray-100 text-gray-600")}>
                            {p.availability}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {p.verified
                            ? <BadgeCheck className="h-5 w-5 text-emerald-500" />
                            : <BadgeX className="h-5 w-5 text-muted-foreground/40" />
                          }
                        </td>
                        <td className="px-4 py-3.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeatured(p.id)}
                            disabled={p.availability === "Rented"}
                            className={cn(
                              "gap-1.5 text-xs rounded-lg",
                              p.featured && p.availability !== "Rented"
                                ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                                : "text-muted-foreground hover:text-amber-600"
                            )}
                          >
                            {p.featured && p.availability !== "Rented" ? (
                              <><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Featured</>
                            ) : (
                              <><StarOff className="h-3.5 w-3.5" /> Feature</>
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <Link href={`/property/${p.id}`}>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-lg">
                                <Eye className="h-3.5 w-3.5" /> View
                              </Button>
                            </Link>
                            {p.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => approveProperty(p.id)} className="gap-1.5 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => rejectProperty(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                                  <XCircle className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </>
                            )}
                            {p.availability !== "Rented" ? (
                              <Button size="sm" variant="outline" onClick={() => markAsBooked(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                                <CalendarCheck className="h-3.5 w-3.5" /> Booked
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => markAsAvailable(p.id)} className="gap-1.5 text-xs rounded-lg border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                                <CheckCircle className="h-3.5 w-3.5" /> Available
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => deleteProperty(p.id)} className="gap-1.5 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
