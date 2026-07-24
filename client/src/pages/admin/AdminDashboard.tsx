import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Users,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  ShieldCheck,
  ShieldOff,
  BadgeCheck,
  BadgeX,
} from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getUsers,
  saveUsers,
  getProperties,
  saveProperties,
  formatCurrency,
  formatDate,
  getSettings,
} from "@/lib/store";
import type { Property, User } from "@/lib/types";
import { toast } from "sonner";
import { Link } from "wouter";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/admin/users", label: "Users", icon: navIcons.users },
  { href: "/admin/properties", label: "Properties", icon: navIcons.properties },
  { href: "/admin/settings", label: "Settings", icon: navIcons.settings },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  hidden: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminDashboard() {
  const [location] = useLocation();
  const [properties, setProperties] = useState<Property[]>(getProperties());
  const [users, setUsers] = useState<User[]>(getUsers());
  const settings = getSettings();

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalProperties: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
  }), [users, properties]);

  const approveProperty = (id: string) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, status: "approved" as const, verified: true } : p
    );
    saveProperties(updated);
    setProperties(updated);
    toast.success("Property approved and verified!");
  };

  const rejectProperty = (id: string) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, status: "rejected" as const } : p
    );
    saveProperties(updated);
    setProperties(updated);
    toast.success("Property rejected.");
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    saveProperties(updated);
    setProperties(updated);
    toast.success("Property deleted.");
  };

  const toggleUserStatus = (id: string) => {
    const updated = users.map((u) =>
      u.id === id
        ? { ...u, status: u.status === "active" ? ("suspended" as const) : ("active" as const) }
        : u
    );
    saveUsers(updated);
    setUsers(updated);
    const user = updated.find((u) => u.id === id);
    toast.success(`User ${user?.status === "active" ? "activated" : "suspended"}.`);
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    saveUsers(updated);
    setUsers(updated);
    toast.success("User deleted.");
  };

  // Determine active tab from route
  const activeTab =
    location === "/admin/users"
      ? "users"
      : location === "/admin/properties"
      ? "properties"
      : "overview";

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard" activePath={location}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} color="teal" />
            <StatCard label="Total Properties" value={stats.totalProperties} icon={<Home className="h-6 w-6" />} color="blue" />
            <StatCard label="Pending Review" value={stats.pending} icon={<Clock className="h-6 w-6" />} color="amber" />
            <StatCard label="Approved" value={stats.approved} icon={<CheckCircle className="h-6 w-6" />} color="teal" />
          </div>

          {/* Pending Properties */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display font-bold">Pending Approvals</h3>
              <Link href="/admin/properties">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {properties.filter((p) => p.status === "pending").length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">No pending properties.</p>
              ) : (
                properties
                  .filter((p) => p.status === "pending")
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.county}, {p.town} · {formatCurrency(p.price, settings.currency)}/mo
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveProperty(p.id)} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectProperty(p.id)} className="gap-1.5 border-rose-400 text-rose-600 hover:bg-rose-50">
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display font-bold">Recent Users</h3>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · <span className="capitalize">{u.role}</span></p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">All Users</h2>
            <span className="text-sm text-muted-foreground">{users.length} total</span>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Joined</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(u.id)}
                            className="gap-1.5 text-xs"
                          >
                            {u.status === "active" ? (
                              <><ShieldOff className="h-3.5 w-3.5" /> Suspend</>
                            ) : (
                              <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(u.id)}
                            className="gap-1.5 text-xs border-rose-300 text-rose-600 hover:bg-rose-50"
                          >
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
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">All Properties</h2>
            <span className="text-sm text-muted-foreground">{properties.length} total</span>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-semibold">Property</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Verified</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium truncate max-w-[200px]">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.type}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.county}, {p.town}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(p.price, settings.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.verified ? (
                          <BadgeCheck className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <BadgeX className="h-5 w-5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Link href={`/property/${p.id}`}>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </Link>
                          {p.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => approveProperty(p.id)} className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectProperty(p.id)} className="gap-1.5 text-xs border-rose-300 text-rose-600 hover:bg-rose-50">
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
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
        </div>
      )}
    </DashboardLayout>
  );
}
