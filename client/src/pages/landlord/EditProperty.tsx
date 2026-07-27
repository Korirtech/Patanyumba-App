import { useState, useId, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Save, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getPropertyDetail, updateMyProperty } from "@/lib/api";
import type { Availability, PropertyStatus } from "@/lib/types";
import { PROPERTY_TYPES, KENYAN_COUNTIES, AMENITY_OPTIONS } from "@/lib/types";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import type { PropertyData } from "@/lib/api";

const navItems = [
  { href: "/landlord/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/landlord/add", label: "Add Property", icon: navIcons.add },
  { href: "/landlord/properties", label: "My Properties", icon: navIcons.properties },
];

// ── Validation helpers ────────────────────────────────────────────────
interface FieldErrors {
  title?: string;
  town?: string;
  price?: string;
  description?: string;
}

function validate(form: EditPropertyFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  } else if (form.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters.";
  }

  if (!form.town.trim()) {
    errors.town = "Town is required.";
  }

  if (!form.price || form.price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (form.description.trim() && form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  return errors;
}

interface EditPropertyFormState {
  title: string;
  description: string;
  county: string;
  town: string;
  estate: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  deposit: number;
  availability: Availability;
  amenities: string[];
  images: string[];
}

// ── Accessible error helper ───────────────────────────────────────────
function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 text-sm text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────
function EditPropertySkeleton() {
  return (
    <DashboardLayout
      navItems={navItems}
      title="Edit Property"
      activePath="/landlord/properties"
    >
      <div className="max-w-3xl space-y-6 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const titleErrorId = `${formId}-title-error`;
  const townErrorId = `${formId}-town-error`;
  const priceErrorId = `${formId}-price-error`;
  const descriptionErrorId = `${formId}-description-error`;
  const formErrorId = `${formId}-form-error`;

  const [form, setForm] = useState<EditPropertyFormState>({
    title: "",
    description: "",
    county: "Nairobi",
    town: "",
    estate: "",
    address: "",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    price: 0,
    deposit: 0,
    availability: "Available",
    amenities: [],
    images: [],
  });

  // Fetch property on mount
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Property ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getPropertyDetail(id);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        const prop = result.data;
        setForm({
          title: prop.title,
          description: prop.description,
          county: prop.county,
          town: prop.town,
          estate: prop.estate || "",
          address: prop.address || "",
          type: prop.type,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          price: prop.price,
          deposit: prop.deposit,
          availability: (prop.availability as Availability) || "Available",
          amenities: prop.amenities || [],
          images: prop.images || [],
        });
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const toggleAmenity = (a: string) => {
    setForm({
      ...form,
      amenities: form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      const errorBanner = document.getElementById(formErrorId);
      if (errorBanner) errorBanner.focus();
      return;
    }

    setSubmitting(true);
    const result = await updateMyProperty(id, {
      title: form.title,
      description: form.description,
      county: form.county,
      town: form.town,
      estate: form.estate,
      address: form.address,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      price: form.price,
      deposit: form.deposit || form.price * 2,
      availability: form.availability,
      amenities: form.amenities,
      images: form.images.length > 0 ? form.images : undefined,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Property updated successfully!");
    navigate("/landlord/properties");
  };

  const errors = validate(form);

  if (loading) {
    return <EditPropertySkeleton />;
  }

  if (error) {
    return (
      <DashboardLayout
        navItems={navItems}
        title="Edit Property"
        activePath="/landlord/properties"
      >
        <div className="max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
          <h2 className="font-display text-lg font-bold text-destructive">Error Loading Property</h2>
          <p className="mt-2 text-sm text-destructive/80">{error}</p>
          <Link href="/landlord/properties">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Properties
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={navItems}
      title="Edit Property"
      activePath="/landlord/properties"
    >
      <div id={formErrorId} tabIndex={-1} role="alert" aria-live="assertive" className="sr-only" />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6" noValidate>
        {Object.keys(errors).length > 0 && (
          <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertCircle className="h-4 w-4" />
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} before submitting
            </h3>
          </div>
        )}

        {/* Basic info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
              Title <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern 2BR Apartment in Kilimani"
              aria-describedby={errors.title ? titleErrorId : undefined}
              aria-invalid={!!errors.title}
            />
            <FieldError id={titleErrorId} message={errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your property — location highlights, nearby amenities, unique features…"
              aria-describedby={errors.description ? descriptionErrorId : undefined}
              aria-invalid={!!errors.description}
            />
            <FieldError id={descriptionErrorId} message={errors.description} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="county">County *</Label>
              <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                <SelectTrigger id="county"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="town" className={errors.town ? "text-destructive" : ""}>Town *</Label>
              <Input
                id="town"
                required
                value={form.town}
                onChange={(e) => setForm({ ...form, town: e.target.value })}
                placeholder="e.g. Kilimani"
                aria-describedby={errors.town ? townErrorId : undefined}
                aria-invalid={!!errors.town}
              />
              <FieldError id={townErrorId} message={errors.town} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estate">Estate / Neighbourhood</Label>
              <Input
                id="estate"
                value={form.estate}
                onChange={(e) => setForm({ ...form, estate: e.target.value })}
                placeholder="e.g. Lavington"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 14 Ngong Road"
              />
            </div>
          </div>
        </div>

        {/* Property details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Property Details</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>
                Price (KSh/month) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                aria-describedby={errors.price ? priceErrorId : undefined}
                aria-invalid={!!errors.price}
              />
              <FieldError id={priceErrorId} message={errors.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (KSh)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: parseFloat(e.target.value) || 0 })}
                placeholder="Auto (2× rent)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select
              value={form.availability}
              onValueChange={(v) => setForm({ ...form, availability: v as Availability })}
            >
              <SelectTrigger id="availability"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Rented">Rented</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {AMENITY_OPTIONS.map((amenity) => (
              <label
                key={amenity}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <Checkbox
                  checked={form.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Property Images</h3>
          <p className="text-sm text-muted-foreground">
            Update your property photos. The first image will be used as the cover photo on listings.
          </p>
          <ImageUploader
            images={form.images}
            onChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Link href="/landlord/properties">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
