import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, Filter, X, Home as HomeIcon, Loader2, SlidersHorizontal, Grid3X3, List } from "lucide-react";
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
import { getAllProperties } from "@/lib/api";
import { PROPERTY_TYPES } from "@/lib/types";
import type { PropertyData } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Properties() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [type, setType] = useState(params.get("type") || "all");
  const [budget, setBudget] = useState(params.get("budget") || "all");
  const [applied, setApplied] = useState({
    search: params.get("search") || "",
    type: params.get("type") || "",
    budget: params.get("budget") || "",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      const result = await getAllProperties();
      if (result.error) {
        setError(result.error);
        setProperties([]);
      } else {
        setProperties(result.data || []);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const s = params.get("search") || "";
    const t = params.get("type") || "";
    const b = params.get("budget") || "";
    setSearchInput(s);
    setType(t || "all");
    setBudget(b || "all");
    setApplied({ search: s, type: t, budget: b });
  }, [search]);

  const filtered = useMemo(() => {
    let result = properties;
    if (applied.search) {
      const s = applied.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.county.toLowerCase().includes(s) ||
          p.town.toLowerCase().includes(s) ||
          p.estate.toLowerCase().includes(s)
      );
    }
    if (applied.type) {
      result = result.filter((p) => p.type === applied.type);
    }
    if (applied.budget) {
      const max = parseInt(applied.budget);
      result = result.filter((p) => p.price <= max);
    }
    return result;
  }, [properties, applied]);

  const applyFilters = () => {
    setApplied({
      search: searchInput.trim(),
      type: type === "all" ? "" : type,
      budget: budget === "all" ? "" : budget,
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setType("all");
    setBudget("all");
    setApplied({ search: "", type: "", budget: "" });
  };

  const hasActiveFilters = applied.search || applied.type || applied.budget;

  return (
    <div className="page-enter">
      {/* Page header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8 md:py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Listings</p>
              <h1 className="font-display text-3xl font-extrabold md:text-4xl">Properties</h1>
              <p className="mt-1.5 text-muted-foreground">
                {loading ? "Loading..." : (
                  <>
                    <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                    {filtered.length === 1 ? "property" : "properties"} available
                    {hasActiveFilters && " (filtered)"}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 md:py-8">
        {/* Filter bar */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by location, estate, or town..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="pl-10 h-11 rounded-xl border-border/60 bg-muted/30"
                disabled={loading}
              />
            </div>

            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger className="lg:w-[155px] h-11 rounded-xl border-border/60 bg-muted/30">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={budget} onValueChange={setBudget} disabled={loading}>
              <SelectTrigger className="lg:w-[145px] h-11 rounded-xl border-border/60 bg-muted/30">
                <SelectValue placeholder="Max Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Budget</SelectItem>
                <SelectItem value="10000">Up to KSh 10k</SelectItem>
                <SelectItem value="20000">Up to KSh 20k</SelectItem>
                <SelectItem value="50000">Up to KSh 50k</SelectItem>
                <SelectItem value="100000">Up to KSh 100k</SelectItem>
                <SelectItem value="200000">Up to KSh 200k</SelectItem>
                <SelectItem value="500000">Up to KSh 500k</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={applyFilters}
                className="gap-2 flex-1 lg:flex-none rounded-xl h-11"
                disabled={loading}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="gap-2 rounded-xl h-11"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground self-center">Active filters:</span>
              {applied.search && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                  Location: {applied.search}
                  <button onClick={() => { setSearchInput(""); setApplied(a => ({ ...a, search: "" })); }} className="hover:text-primary/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {applied.type && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                  Type: {applied.type}
                  <button onClick={() => { setType("all"); setApplied(a => ({ ...a, type: "" })); }} className="hover:text-primary/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {applied.budget && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                  Budget: KSh {parseInt(applied.budget).toLocaleString()}
                  <button onClick={() => { setBudget("all"); setApplied(a => ({ ...a, budget: "" })); }} className="hover:text-primary/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* View toggle */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> results
            </p>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
              <X className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Failed to Load Properties</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
              Try Again
            </Button>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className={cn(
            "gap-5",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col"
          )}>
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        {/* Empty state – no properties at all */}
        {!loading && !error && filtered.length === 0 && properties.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <HomeIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground text-sm">
              There are no properties available at the moment. Check back soon.
            </p>
          </div>
        )}

        {/* No results state – filters returned nothing */}
        {!loading && !error && filtered.length === 0 && properties.length > 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">No Matching Properties</h3>
            <p className="text-muted-foreground text-sm mb-6">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={resetFilters} variant="outline" className="rounded-xl gap-2">
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
