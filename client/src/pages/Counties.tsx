import { Link } from "wouter";
import { MapPin, Building2 } from "lucide-react";
import { getApprovedProperties } from "@/lib/store";
import { KENYAN_COUNTIES } from "@/lib/types";

export default function Counties() {
  const props = getApprovedProperties();

  return (
    <div className="page-enter">
      {/* Hero banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-10">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">Explore Kenya</h1>
          <p className="mt-2 text-primary-foreground/80 text-lg max-w-xl">
            Discover verified properties across Kenya's counties. From Nairobi's urban hubs to Kiambu's leafy suburbs.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 text-primary-foreground/70">
              <Building2 className="h-4 w-4" /> {props.length} active listings
            </span>
            <span className="flex items-center gap-2 text-primary-foreground/70">
              <MapPin className="h-4 w-4" /> {props.length > 0 ? new Set(props.map((p) => p.county)).size : 0} counties with properties
            </span>
          </div>
        </div>
      </section>

      {/* County grid */}
      <section className="container py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {KENYAN_COUNTIES.map((county) => {
            const count = props.filter((p) => p.county === county).length;
            const hasProps = count > 0;
            return (
              <Link
                key={county}
                href={`/properties?search=${encodeURIComponent(county)}`}
                className={`group rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                  hasProps ? "cursor-pointer" : "opacity-60"
                }`}
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                  hasProps ? "bg-primary/10" : "bg-muted"
                }`}>
                  <MapPin className={`h-7 w-7 transition-transform group-hover:scale-110 ${
                    hasProps ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <h4 className="mt-3 font-display font-bold">{county}</h4>
                <p className="text-xs text-muted-foreground">
                  {hasProps ? `${count} propert${count === 1 ? "y" : "ies"}` : "Coming soon"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
