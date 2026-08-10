import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  Settings,
  PlusCircle,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/BrandMark";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  activePath: string;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
  activePath,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <BrandMark className="h-8 w-8 rounded-xl" />
        <span className="font-display text-base font-extrabold">
          <span className="text-primary">Pata</span>
          <span className="text-sidebar-foreground">Nyumba</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Navigation
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick link back to site */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Quick Links
          </p>
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <Home className="h-4 w-4 shrink-0" />
            Back to Site
          </Link>
          <Link
            href="/properties"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <Search className="h-4 w-4 shrink-0" />
            Browse Properties
          </Link>
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="md:hidden fixed bottom-5 right-5 z-40 shadow-lg shadow-primary/20 rounded-full h-12 w-12 p-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[270px] p-0 border-r border-sidebar-border">
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-10 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar */}
        <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <nav className="flex items-center gap-1.5 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{title}</span>
            </nav>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{user?.name}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}

// Convenience icon components for nav items
export const navIcons = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  properties: <Home className="h-4 w-4" />,
  reports: <FileText className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  add: <PlusCircle className="h-4 w-4" />,
  favorites: <Heart className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
};
