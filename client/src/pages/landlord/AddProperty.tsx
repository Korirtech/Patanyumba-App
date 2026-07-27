import { useState, useId, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PlusCircle, ImagePlus, Save, AlertCircle, X, Loader2, Upload } from "lucide-react";
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
import { addProperty, uploadImage } from "@/lib/api";
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
  const [uploading, setUploading] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstErrorRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrl.trim()] });
    setImageUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data?.imageUrl) {
        setForm(prev => ({ ...prev, images: [...prev.images, result.data!.imageUrl] }));
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      const errorBanner = document.getElementById(formErrorId);
      if (errorBanner) {
        errorBanner.focus();
      }
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

  const titleDescribedBy = [titleDescId, titleErrorId].join(" ").trim();
  const townDescribedBy = [townDescId, townErrorId].join(" ").trim();
  const priceDescribedBy = [priceDescId, priceErrorId].join(" ").trim();
  const descriptionDescribedBy = [descriptionDescId, descriptionErrorId].join(" ").trim();
  const imagesDescribedBy = [imagesDescId, imagesErrorId].join(" ").trim();

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
              placeholder="Describe your property..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              />
              <FieldError id={townErrorId} message={errors.town} />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>Price (KSh/month) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
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
                placeholder="Auto (2x rent)"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Images</h3>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Image
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Or paste an image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
            />
            <Button type="button" variant="secondary" onClick={addImageUrl}>Add URL</Button>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={img.startsWith("/") ? img : img}
                    alt={`Property ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit Property"}
          </Button>
          <Link href="/landlord/dashboard">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
