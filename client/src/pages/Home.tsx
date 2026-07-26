import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, MapPin, Home as HomeIcon, ShieldCheck, MessageCircle, TrendingUp, Star, ArrowRight, Building2, Users, Zap, Loader2 } from "lucide-react";
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

  // Fetch featured properties from the server (admin-managed, featured flag)
  useEffect(() => {
    let cancelled = false;
    setFeaturedLoading(true);
    getFeaturedProperties().then((result) => {
      if (cancelled) return;
      if (!result.error && result.data) {
        setFeatured(result.data);
      } else {
        // Fallback to localStorage-based approved properties if API is unavailable
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-secondary/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.24),transparent_32%),radial-gradient(circle_at_20%_90%,rgba(255,255,255,0.14),transparent_28%)]" />
        </div>

        <div className="container relative py-16 md:py-24 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              Find Your Next Home
              <br />
              <span className="text-primary-foreground/90">with Confidence</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/80 md:text-lg">
              Kenya's trusted property marketplace. Browse verified listings, connect with landlords instantly, and find the perfect place to call home.
            </p>

            {/* Search Pill */}
            <div className="mt-8 rounded-2xl bg-card p-3 shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by location, estate, or town..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>

                <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
                  <SelectTrigger className="sm:w-[140px] border-0 bg-muted/50">
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
                  <SelectTrigger className="sm:w-[130px] border-0 bg-muted/50">
                    <SelectValue placeholder="Max Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Budget</SelectItem>
                    <SelectItem value="10000">KSh 10k</SelectItem>
                    <SelectItem value="20000">KSh 20k</SelectItem>
                    <SelectItem value="50000">KSh 50k</SelectItem>
                    <SelectItem value="100000">KSh 100k</SelectItem>
                    <SelectItem value="200000">KSh 200k</SelectItem>
                    <SelectItem value="500000">KSh 500k</SelectItem>
                  </SelectContent>
                </Select>

                <Link href={buildSearchUrl()}>
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                <span className="text-sm"><strong>{approvedProps.length}</strong> Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm"><strong>{countyCounts.length}</strong> Counties</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm"><strong>{approvedProps.filter(p => p.verified).length}</strong> Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Featured Properties</h2>
            <p className="mt-1 text-muted-foreground">Discover our handpicked selection of the best listings.</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="gap-2 shrink-0">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  amenities: [],
                  availability: p.availability as any,
                  status: p.status as any,
                  images: [],
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
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No featured properties at the moment. Check back soon.</p>
          </div>
        )}
      </section>

      {/* Trust band */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 shrink-0" />
              <div>
                <div className="font-display text-xl font-bold">100%</div>
                <div className="text-xs text-primary-foreground/70">Verified Listings</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 shrink-0" />
              <div>
                <div className="font-display text-xl font-bold">Direct</div>
                <div className="text-xs text-primary-foreground/70">WhatsApp Contact</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 shrink-0" />
              <div>
                <div className="font-display text-xl font-bold">{approvedProps.length}+</div>
                <div className="text-xs text-primary-foreground/70">Active Listings</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 shrink-0" />
              <div>
                <div className="font-display text-xl font-bold">3 Roles</div>
                <div className="text-xs text-primary-foreground/70">Admin · Landlord · Client</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container py-16">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Why Choose PataNyumba?</h2>
            <p className="mt-2 text-muted-foreground">We make the home-finding journey simple, transparent, and trustworthy.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Verified Listings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every property is reviewed and verified by our team to ensure you see only authentic listings.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <MessageCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Instant Communication</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with landlords directly via WhatsApp. No agents, no delays — just direct conversation.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Zap className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Smart Search</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Filter by location, type, and budget to find exactly what you're looking for in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Counties */}
      {countyCounts.length > 0 && (
        <section className="container py-16">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Browse by County</h2>
            <p className="mt-1 text-muted-foreground">Explore properties across Kenya's major counties.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {countyCounts.map(({ county, count }) => (
              <Link
                key={county}
                href={`/properties?search=${encodeURIComponent(county)}`}
                className="group rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <MapPin className="mx-auto h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h4 className="mt-3 font-display font-bold">{county}</h4>
                <p className="text-xs text-muted-foreground">{count} properties</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-muted/30 border-t border-border">
        <div className="container py-16">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">What Our Users Say</h2>
            <p className="mt-2 text-muted-foreground">Real stories from real people.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { quote: "PataNyumba made finding my apartment in Kilimani so easy. The verified badge gave me confidence, and I messaged the landlord on WhatsApp the same day.", name: "Sarah M.", role: "Tenant, Kilimani" },
              { quote: "As a landlord in Westlands, I listed my bedsitter and got approved within hours. Three inquiries came in the first week — all through WhatsApp.", name: "David K.", role: "Landlord, Westlands" },
              { quote: "I searched by county and budget, found a studio in Runda, and signed the lease within a week. PataNyumba cut out all the middlemen.", name: "Michael O.", role: "Tenant, Runda" },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="italic text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Ready to Find Your Next Home?</h2>
          <p className="mt-2 text-primary-foreground/80">Join PataNyumba today and browse verified properties across Kenya.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button variant="secondary" size="lg">Create Free Account</Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
