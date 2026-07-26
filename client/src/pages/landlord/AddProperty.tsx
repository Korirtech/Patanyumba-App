import { useState, useId, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PlusCircle, ImagePlus, Save, AlertCircle } from "lucide-react";
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

// ── Accessible description helper component ───────────────────────────
function FieldDescription({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}

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
  const titleDescId = `${formId}-title-desc`;
  const townErrorId = `${formId}-town-error`;
  const townDescId = `${formId}-town-desc`;
  const priceErrorId = `${formId}-price-error`;
  const priceDescId = `${formId}-price-desc`;
  const descriptionErrorId = `${formId}-description-error`;
  const descriptionDescId = `${formId}-description-desc`;
  const imagesErrorId = `${formId}-images-error`;
  const imagesDescId = `${formId}-images-desc`;
  const formErrorId = `${formId}-form-error`;

  // Focus management: ref to the first invalid field
  const firstErrorRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset submitted state when form changes
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
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);
    }
  }, [form]);

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrl.trim()] });
    setImageUrl("");
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

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
      toast.error("Please fix the errors before submitting");
      // Focus the form-level error banner for screen readers
      const errorBanner = document.getElementById(formErrorId);
      if (errorBanner) {
        errorBanner.focus();
      }
      return;
    }

    setLoading(true);
    const result = await addProperty({
      title: form.title.trim(),
      description: form.description.trim(),
      county: form.county,
      town: form.town.trim(),
      estate: form.estate.trim(),
      address: form.address.trim(),
      lat: -1.2921,
      lng: 36.8219,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      price: form.price,
      deposit: form.deposit || form.price * 2,
      amenities: form.amenities,
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
    navigate("/landlord/dashboard");
  };

  const errors = validate(form);

  // Build aria-describedby values
  const titleDescribedBy = [titleDescId, titleErrorId].join(" ").trim();
  const townDescribedBy = [townDescId, townErrorId].join(" ").trim();
  const priceDescribedBy = [priceDescId, priceErrorId].join(" ").trim();
  const descriptionDescribedBy = [
    descriptionDescId,
    descriptionErrorId,
  ]
    .join(" ")
    .trim();
  const imagesDescribedBy = [imagesDescId, imagesErrorId].join(" ").trim();

  return (
    <DashboardLayout
      navItems={navItems}
      title="Add Property"
      activePath="/landlord/add"
    >
      {/* Live region for screen readers to announce validation errors */}
      <div
        id={formErrorId}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        className="sr-only"
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6"
        noValidate
        aria-describedby={
          Object.keys(errors).length > 0
            ? formErrorId
            : undefined
        }
      >
        {/* Form-level error summary for screen readers */}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertCircle className="h-4 w-4" />
              Please fix {Object.keys(errors).length} error
              {Object.keys(errors).length > 1 ? "s" : ""} before submitting
            </h3>
            <ul className="mt-2 list-inside list-disc text-sm text-destructive space-y-0.5">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}: {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">
            Basic Information
          </h3>

          {/* Title */}
          <div ref={firstErrorRef} className="space-y-2">
            <Label
              htmlFor="title"
              className={errors.title ? "text-destructive" : ""}
            >
              Title <span aria-hidden="true">*</span>
            </Label>
            <span className="sr-only">
              Required field
            </span>
            <FieldDescription id={titleDescId}>
              Enter a descriptive title for your property (at least 5
              characters).
            </FieldDescription>
            <Input
              id="title"
              required
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={titleDescribedBy}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern 2BR Apartment in Kilimani"
            />
            <FieldError id={titleErrorId} message={errors.title} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className={errors.description ? "text-destructive" : ""}
            >
              Description
            </Label>
            <FieldDescription id={descriptionDescId}>
              Describe your property. Minimum 10 characters if provided.
            </FieldDescription>
            <Textarea
              id="description"
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={descriptionDescribedBy}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe your property..."
            />
            <FieldError
              id={descriptionErrorId}
              message={errors.description}
            />
          </div>

          {/* County & Town */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-county`}>
                County <span aria-hidden="true">*</span>
              </Label>
              <Select
                value={form.county}
                onValueChange={(v) => setForm({ ...form, county: v })}
              >
                <SelectTrigger
                  id={`${formId}-county`}
                  aria-required="true"
                >
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="town"
                className={errors.town ? "text-destructive" : ""}
              >
                Town <span aria-hidden="true">*</span>
              </Label>
              <span className="sr-only">Required field</span>
              <FieldDescription id={townDescId}>
                Enter the town where your property is located.
              </FieldDescription>
              <Input
                id="town"
                required
                aria-required="true"
                aria-invalid={!!errors.town}
                aria-describedby={townDescribedBy}
                value={form.town}
                onChange={(e) => setForm({ ...form, town: e.target.value })}
                placeholder="e.g. Kilimani"
              />
              <FieldError id={townErrorId} message={errors.town} />
            </div>
          </div>

          {/* Estate & Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estate">Estate</Label>
              <Input
                id="estate"
                value={form.estate}
                onChange={(e) =>
                  setForm({ ...form, estate: e.target.value })
                }
                placeholder="e.g. Valley Arcade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="e.g. Off Ngong Road"
              />
            </div>
          </div>
        </div>

        {/* Property details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">
            Property Details
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-type`}>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id={`${formId}-type`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-bedrooms`}>Bedrooms</Label>
              <Input
                id={`${formId}-bedrooms`}
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) =>
                  setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-bathrooms`}>Bathrooms</Label>
              <Input
                id={`${formId}-bathrooms`}
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bathrooms: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className={errors.price ? "text-destructive" : ""}
              >
                Monthly Rent (KSh) <span aria-hidden="true">*</span>
              </Label>
              <span className="sr-only">Required field</span>
              <FieldDescription id={priceDescId}>
                Enter the monthly rent amount.
              </FieldDescription>
              <Input
                id="price"
                type="number"
                required
                aria-required="true"
                aria-invalid={!!errors.price}
                aria-describedby={priceDescribedBy}
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                placeholder="e.g. 50000"
              />
              <FieldError id={priceErrorId} message={errors.price} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-deposit`}>
                Deposit (KSh)
              </Label>
              <FieldDescription id={`${formId}-deposit-desc`}>
                Leave blank to auto-calculate as 2x monthly rent.
              </FieldDescription>
              <Input
                id={`${formId}-deposit`}
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deposit: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Auto-calculated if empty"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AMENITY_OPTIONS.map((a) => (
              <div key={a} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${a}`}
                  checked={form.amenities.includes(a)}
                  onCheckedChange={() => toggleAmenity(a)}
                />
                <Label
                  htmlFor={`amenity-${a}`}
                  className="font-normal cursor-pointer"
                >
                  {a}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Images</h3>
          <FieldDescription id={imagesDescId}>
            Add image URLs. At least one image is required.
          </FieldDescription>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {form.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {form.images.length} image{form.images.length > 1 ? "s" : ""} added
              </p>
              <div className="space-y-1">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <p className="truncate text-sm text-muted-foreground">
                      {img}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(idx)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit Property"}
          </Button>
          <Link href="/landlord/dashboard">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
