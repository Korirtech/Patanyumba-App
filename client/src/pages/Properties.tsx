import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, Filter, X, Home as HomeIcon, Loader2 } from "lucide-react";
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

export default function Properties() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [type, setType] = useState(params.get("type") || "all");
  const [budget, setBudget] = useState(params.get("budget") || "all");
  const [applied, setApplied] = useState({
    search: params.get("search") || "",
    type: params.get("type") || "",
    budget: params.get("budget") || "",
  });

  // Fetch properties from server on mount
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

  // Sync from URL on navigation
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

  return (
    <div className="page-enter container py-8 md:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Properties</h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "property" : "properties"} available
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location, estate, or town..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-10"
              disabled={loading}
            />
          </div>

          <Select value={type} onValueChange={setType} disabled={loading}>
            <SelectTrigger className="lg:w-[150px]">
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
            <SelectTrigger className="lg:w-[140px]">
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

          <Button onClick={applyFilters} className="gap-2 lg:w-auto" disabled={loading}>
            <Filter className="h-4 w-4" />
            Apply
          </Button>
          <Button onClick={resetFilters} variant="outline" className="gap-2 lg:w-auto" disabled={loading}>
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading properties...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load properties: {error}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && properties.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No properties available yet.
          </p>
        </div>
      )}

      {/* No results state */}
      {!loading && !error && filtered.length === 0 && properties.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No properties found matching your criteria.
          </p>
          <Button onClick={resetFilters} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
