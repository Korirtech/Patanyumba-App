import { useState, useId, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PlusCircle, Save, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { addProperty } from "@/lib/api";
import type { Availability } from "@/lib/types";
import { PROPERTY_TYPES, KENYAN_COUNTIES, AMENITY_OPTIONS } from "@/lib/types";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";

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
  images?: string;
}

function validate(form: AddPropertyFormState): FieldErrors {
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

interface AddPropertyFormState {
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

// ── Accessible description helper components ──────────────────────────
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

// ── Main component ────────────────────────────────────────────────────
export default function AddProperty() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const formId = useId();
  const titleErrorId = `${formId}-title-error`;
  const townErrorId = `${formId}-town-error`;
  const priceErrorId = `${formId}-price-error`;
  const descriptionErrorId = `${formId}-description-error`;
  const formErrorId = `${formId}-form-error`;

  const [form, setForm] = useState<AddPropertyFormState>({
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
    amenities: [] as string[],
    images: [] as string[],
  });

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
    if (!user) return;

    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      const errorBanner = document.getElementById(formErrorId);
      if (errorBanner) errorBanner.focus();
      return;
    }

    setLoading(true);
    const result = await addProperty({
      ...form,
      lat: -1.2921,
      lng: 36.8219,
      deposit: form.deposit || form.price * 2,
      images:
        form.images.length > 0
          ? form.images
          : [
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
            ],
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      "Property added! It will be reviewed by admin before going live."
    );
    navigate("/landlord/properties");
  };

  const errors = validate(form);

  return (
    <DashboardLayout
      navItems={navItems}
      title="Add Property"
      activePath="/landlord/add"
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
                <SelectItem value="Occupied">Occupied</SelectItem>
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

        {/* Images – enhanced uploader */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Property Images</h3>
          <p className="text-sm text-muted-foreground">
            Upload high-quality photos of your property. The first image will be used as the cover photo on listings.
          </p>
          <ImageUploader
            images={form.images}
            onChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Submitting…" : "Submit Property"}
          </Button>
          <Link href="/landlord/dashboard">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
