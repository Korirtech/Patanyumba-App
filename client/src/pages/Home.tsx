import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Search, MapPin, Home as HomeIcon, ShieldCheck, MessageCircle, TrendingUp,
  Star, ArrowRight, Building2, Users, Zap, Loader2, CheckCircle2, Play, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertyCard from "@/components/PropertyCard";
import { getApprovedProperties, getProperties } from "@/lib/store";
import { getFeaturedProperties } from "@/lib/api";
import type { PropertyData } from "@/lib/api";
import { PROPERTY_TYPES, KENYAN_COUNTIES } from "@/lib/types";

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [featured, setFeatured] = useState<PropertyData[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFeaturedLoading(true);
    getFeaturedProperties().then((result) => {
      if (cancelled) return;
      if (!result.error && result.data) {
        setFeatured(result.data);
      } else {
        const fallback = getApprovedProperties()
          .filter((p) => p.featured)
          .slice(0, 6);
        setFeatured(
          fallback.map((p) => ({
            id: p.id,
            landlordId: p.landlordId,
            title: p.title,
            description: p.description,
            county: p.county,
            town: p.town,
            estate: p.estate,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            type: p.type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            price: p.price,
            deposit: p.deposit,
            amenities: p.amenities || [],
            images: p.images || [],
            availability: p.availability,
            status: p.status,
            verified: p.verified,
            featured: p.featured ?? false,
            views: p.views,
            inquiries: p.inquiries,
            whatsappClicks: p.whatsappClicks,
            createdAt: p.createdAt,
          }))
        );
      }
      setFeaturedLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const approvedProps = getApprovedProperties();
  const allProps = getProperties();
  const countyCounts = KENYAN_COUNTIES.map((c) => ({
    county: c,
    count: allProps.filter((p) => p.county === c && p.status === "approved").length,
  })).filter((c) => c.count > 0);

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (budget) params.set("budget", budget);
    return `/properties?${params.toString()}`;
  };

  return (
    <div className="page-enter">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient">
        {/* Pattern overlay */}
        <div className="absolute inset-0 hero-pattern opacity-20" />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/8 blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 right-1/4 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-6 fade-in-up fade-in-up-delay-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Kenya's #1 Property Marketplace</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl md:text-6xl fade-in-up fade-in-up-delay-1">
              Find Your Perfect
              <br />
              <span className="text-white/70">Home in Kenya</span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/65 md:text-lg leading-relaxed fade-in-up fade-in-up-delay-2">
              Browse verified listings, connect directly with landlords via WhatsApp, and find the perfect place to call home — no agents, no delays.
            </p>

            {/* Search card */}
            <div className="mt-8 rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl p-3 shadow-2xl shadow-black/20 fade-in-up fade-in-up-delay-2">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by location, estate, or town..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-0 bg-muted/40 focus:bg-muted/60 rounded-xl text-sm"
                  />
                </div>

                <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
                  <SelectTrigger className="sm:w-[145px] h-11 border-0 bg-muted/40 rounded-xl text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={budget || "all"} onValueChange={(v) => setBudget(v === "all" ? "" : v)}>
                  <SelectTrigger className="sm:w-[130px] h-11 border-0 bg-muted/40 rounded-xl text-sm">
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Budget</SelectItem>
                    <SelectItem value="10000">KSh 10k</SelectItem>
                    <SelectItem value="20000">KSh 20k</SelectItem>
                    <SelectItem value="50000">KSh 50k</SelectItem>
                    <SelectItem value="100000">KSh 100k</SelectItem>
                    <SelectItem value="200000">KSh 200k</SelectItem>
                    <SelectItem value="500000">KSh 500k+</SelectItem>
                  </SelectContent>
                </Select>

                <Link href={buildSearchUrl()}>
                  <Button size="lg" className="gap-2 w-full sm:w-auto h-11 rounded-xl font-semibold shadow-sm shadow-primary/30 pulse-glow">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-7 flex flex-wrap gap-5 text-white/80 fade-in-up fade-in-up-delay-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <HomeIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">
                  <strong className="text-white">{approvedProps.length}+</strong> Properties
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">
                  <strong className="text-white">{countyCounts.length}</strong> Counties
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">
                  <strong className="text-white">{approvedProps.filter(p => p.verified).length}</strong> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Band ───────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: ShieldCheck, label: "Verified Listings", value: "100%", color: "text-primary" },
              { icon: MessageCircle, label: "WhatsApp Direct", value: "Instant", color: "text-emerald-600" },
              { icon: Building2, label: "Active Listings", value: `${approvedProps.length}+`, color: "text-blue-600" },
              { icon: Users, label: "User Roles", value: "3 Types", color: "text-amber-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ──────────────────────────────────────── */}
      <section className="container section-padding">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Handpicked for You</p>
            <h2 className="section-heading">Featured Properties</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              Discover our curated selection of the best verified listings across Kenya.
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="gap-2 shrink-0 rounded-xl">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard
                key={p.id}
                property={{
                  id: p.id,
                  landlordId: p.landlordId,
                  title: p.title,
                  description: p.description,
                  county: p.county,
                  town: p.town,
                  estate: p.estate,
                  address: p.address,
                  lat: p.lat,
                  lng: p.lng,
                  type: p.type,
                  bedrooms: p.bedrooms,
                  bathrooms: p.bathrooms,
                  price: p.price,
                  deposit: p.deposit,
                  amenities: p.amenities || [],
                  availability: p.availability as any,
                  status: p.status as any,
                  images: p.images || [],
                  views: p.views,
                  inquiries: p.inquiries,
                  whatsappClicks: p.whatsappClicks,
                  createdAt: p.createdAt,
                  verified: p.verified,
                  featured: p.featured,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <HomeIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">No Featured Properties Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Check back soon for our handpicked listings.</p>
            <Link href="/properties">
              <Button variant="outline" className="rounded-xl">Browse All Properties</Button>
            </Link>
          </div>
        )}
      </section>

      {/* ─── Why Choose Us ────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container section-padding">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Why PataNyumba</p>
            <h2 className="section-heading">The Smarter Way to Find a Home</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We've reimagined the property search experience for Kenya — transparent, fast, and trustworthy.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Listings",
                desc: "Every property is reviewed and verified by our team. No fake listings, no scams — ever.",
                color: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: MessageCircle,
                title: "Instant WhatsApp",
                desc: "Connect directly with landlords via WhatsApp. No agents, no middlemen, no delays.",
                color: "bg-emerald-500/10",
                iconColor: "text-emerald-600",
              },
              {
                icon: Zap,
                title: "Smart Search",
                desc: "Filter by county, type, budget, and more to find exactly what you need in seconds.",
                color: "bg-blue-500/10",
                iconColor: "text-blue-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by County ─────────────────────────────────────────── */}
      {countyCounts.length > 0 && (
        <section className="container section-padding">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Explore Kenya</p>
              <h2 className="section-heading">Browse by County</h2>
              <p className="mt-2 text-muted-foreground">
                Explore properties across Kenya's major counties.
              </p>
            </div>
            <Link href="/counties">
              <Button variant="outline" className="gap-2 shrink-0 rounded-xl">
                All Counties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {countyCounts.slice(0, 10).map(({ county, count }) => (
              <Link
                key={county}
                href={`/properties?search=${encodeURIComponent(county)}`}
                className="group rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/30 hover:bg-primary/3"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <MapPin className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <h4 className="font-display font-bold text-sm">{county}</h4>
                <p className="text-xs text-muted-foreground mt-1">{count} {count === 1 ? "property" : "properties"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-primary/3 border-y border-border">
        <div className="container section-padding">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Simple Process</p>
            <h2 className="section-heading">How PataNyumba Works</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Find your perfect home in three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
            {[
              { step: "01", icon: Search, title: "Search & Filter", desc: "Use our smart search to filter by location, type, budget, and more to find your ideal property." },
              { step: "02", icon: HomeIcon, title: "Browse Listings", desc: "View detailed property pages with photos, amenities, and verified information." },
              { step: "03", icon: MessageCircle, title: "Contact Directly", desc: "Reach out to landlords instantly via WhatsApp and schedule a viewing." },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border-2 border-primary text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────── */}
      <section className="container section-padding">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Happy Users</p>
          <h2 className="section-heading">What Our Users Say</h2>
          <p className="mt-2 text-muted-foreground">Real stories from real people across Kenya.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              quote: "PataNyumba made finding my apartment in Kilimani so easy. The verified badge gave me confidence, and I messaged the landlord on WhatsApp the same day.",
              name: "Sarah M.",
              role: "Tenant, Kilimani",
              initials: "SM",
            },
            {
              quote: "As a landlord in Westlands, I listed my bedsitter and got approved within hours. Three inquiries came in the first week — all through WhatsApp.",
              name: "David K.",
              role: "Landlord, Westlands",
              initials: "DK",
            },
            {
              quote: "I searched by county and budget, found a studio in Runda, and signed the lease within a week. PataNyumba cut out all the middlemen.",
              name: "Michael O.",
              role: "Tenant, Runda",
              initials: "MO",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
            >
              {/* Stars */}
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/8 blur-2xl" />

        <div className="container relative section-padding text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl mb-4">
              Ready to Find Your Next Home?
            </h2>
            <p className="text-white/65 text-lg mb-8 leading-relaxed">
              Join thousands of Kenyans who've found their perfect home through PataNyumba. It's free to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-lg shadow-black/20 gap-2"
                >
                  <Users className="h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/properties">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold rounded-xl gap-2"
                >
                  <Search className="h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
