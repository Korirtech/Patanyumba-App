import { Link } from "wouter";
import { MapPin, Building2, Search, ArrowRight } from "lucide-react";
import { getApprovedProperties } from "@/lib/store";
import { KENYAN_COUNTIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Counties() {
  const props = getApprovedProperties();
  const countiesWithProps = new Set(props.map((p) => p.county)).size;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/8 blur-2xl translate-y-1/3 -translate-x-1/3" />

        <div className="container relative py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-5">
              <MapPin className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white/90">All 47 Counties</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl mb-4">
              Explore Kenya
            </h1>
            <p className="text-white/65 text-lg leading-relaxed max-w-xl mb-6">
              Discover verified properties across Kenya's counties — from Nairobi's urban hubs to Kiambu's leafy suburbs and beyond.
            </p>
            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
                <Building2 className="h-5 w-5 text-white/70" />
                <div>
                  <p className="font-display text-lg font-bold text-white">{props.length}</p>
                  <p className="text-xs text-white/50">Active Listings</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5">
                <MapPin className="h-5 w-5 text-white/70" />
                <div>
                  <p className="font-display text-lg font-bold text-white">{countiesWithProps}</p>
                  <p className="text-xs text-white/50">Counties Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* County grid */}
      <section className="container section-padding">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Browse</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">All Counties</h2>
            <p className="mt-1.5 text-muted-foreground">
              Click on a county to browse its available properties.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {KENYAN_COUNTIES.map((county) => {
            const count = props.filter((p) => p.county === county).length;
            const hasProps = count > 0;
            return (
              <Link
                key={county}
                href={`/properties?search=${encodeURIComponent(county)}`}
                className={cn(
                  "group rounded-2xl border bg-card p-5 text-center shadow-sm transition-all duration-300",
                  hasProps
                    ? "border-border hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/30 cursor-pointer"
                    : "border-border/50 opacity-50 cursor-default"
                )}
              >
                <div className={cn(
                  "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-all duration-300",
                  hasProps
                    ? "bg-primary/10 group-hover:bg-primary group-hover:scale-110"
                    : "bg-muted"
                )}>
                  <MapPin className={cn(
                    "h-6 w-6 transition-colors",
                    hasProps
                      ? "text-primary group-hover:text-primary-foreground"
                      : "text-muted-foreground"
                  )} />
                </div>
                <h4 className="font-display font-bold text-sm leading-tight">{county}</h4>
                <p className={cn(
                  "text-xs mt-1",
                  hasProps ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {hasProps ? `${count} ${count === 1 ? "property" : "properties"}` : "Coming soon"}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Search className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Can't Find Your County?</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Use our advanced search to find properties by specific town, estate, or keyword across all of Kenya.
          </p>
          <Link href="/properties">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
              <Search className="h-4 w-4" />
              Search All Properties
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
