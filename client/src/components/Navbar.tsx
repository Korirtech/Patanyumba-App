import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Sun, LogOut, UserCircle, Building2, Contrast, ChevronDown, Home, MapPin, Info, Phone, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/BrandMark";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: List },
  { href: "/counties", label: "Counties", icon: MapPin },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "landlord"
        ? "/landlord/dashboard"
        : "/client/dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-2xl shadow-md border-b border-border/50"
          : "bg-background/70 backdrop-blur-xl border-b border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <BrandMark className="transition-transform duration-200 group-hover:scale-105" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            <span className="text-primary">Pata</span>
            <span className="text-foreground">Nyumba</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? location === "/"
                : location.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* High-contrast toggle */}
          <Button
            variant={highContrast ? "default" : "ghost"}
            size="icon"
            onClick={toggleHighContrast}
            aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
            aria-pressed={highContrast}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
            title="High contrast"
          >
            <Contrast className="h-4 w-4" />
          </Button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href={dashboardPath}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Logout"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-medium"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-full font-medium shadow-sm shadow-primary/20 hover:shadow-primary/30"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full h-9 w-9"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <Link href="/" className="flex items-center gap-2">
                    <BrandMark className="h-7 w-7" />
                    <span className="font-display text-lg font-extrabold">
                      <span className="text-primary">Pata</span>
                      <span className="text-foreground">Nyumba</span>
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? location === "/"
                        : location.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                          {link.label}
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                {/* Preferences */}
                <div className="px-3 py-3 border-t border-border space-y-1">
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40">
                    <span className="text-sm font-medium">Dark mode</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Toggle dark mode"
                      className="h-8 w-8 rounded-full"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40">
                    <span className="text-sm font-medium">High contrast</span>
                    <Button
                      variant={highContrast ? "default" : "ghost"}
                      size="icon"
                      onClick={toggleHighContrast}
                      aria-label="Toggle high contrast"
                      aria-pressed={highContrast}
                      className="h-8 w-8 rounded-full"
                    >
                      <Contrast className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Auth actions */}
                <div className="px-4 py-4 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Link href={dashboardPath}>
                          <Button variant="outline" className="w-full gap-2 rounded-xl">
                            <Building2 className="h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="w-full gap-2 justify-start rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Link href="/login">
                          <Button variant="outline" className="w-full rounded-xl">
                            Login
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/register">
                          <Button className="w-full rounded-xl">Get Started</Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
