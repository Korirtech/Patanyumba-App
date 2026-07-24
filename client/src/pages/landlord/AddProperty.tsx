import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PlusCircle, ImagePlus, Save } from "lucide-react";
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
import {
  getProperties,
  saveProperties,
  generateId,
} from "@/lib/store";
import type { Property, Availability } from "@/lib/types";
import { PROPERTY_TYPES, KENYAN_COUNTIES, AMENITY_OPTIONS } from "@/lib/types";
import { toast } from "sonner";

const navItems = [
  { href: "/landlord/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/landlord/add", label: "Add Property", icon: navIcons.add },
  { href: "/landlord/properties", label: "My Properties", icon: navIcons.properties },
];

export default function AddProperty() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
    availability: "Available" as Availability,
    amenities: [] as string[],
    images: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.town.trim() || form.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    const newProp: Property = {
      id: generateId(),
      landlordId: user.id,
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
      availability: form.availability,
      status: "pending",
      images: form.images.length > 0 ? form.images : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"],
      views: 0,
      inquiries: 0,
      whatsappClicks: 0,
      createdAt: new Date().toISOString(),
      verified: false,
    };
    const all = getProperties();
    all.push(newProp);
    saveProperties(all);
    setLoading(false);
    toast.success("Property added! It will be reviewed by admin before going live.");
    navigate("/landlord/dashboard");
  };

  return (
    <DashboardLayout navItems={navItems} title="Add Property" activePath="/landlord/add">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Modern 2BR Apartment in Kilimani" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your property..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>County *</Label>
              <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="town">Town *</Label>
              <Input id="town" required value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} placeholder="e.g. Kilimani" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estate">Estate</Label>
              <Input id="estate" value={form.estate} onChange={(e) => setForm({ ...form, estate: e.target.value })} placeholder="e.g. Valley Arcade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Off Ngong Road" />
            </div>
          </div>
        </div>

        {/* Property details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Property Details</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (KSh/month) *</Label>
              <Input id="price" type="number" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} placeholder="e.g. 45000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (KSh)</Label>
              <Input id="deposit" type="number" min={0} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: parseInt(e.target.value) || 0 })} placeholder="e.g. 90000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v as Availability })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          <div className="flex flex-wrap gap-3">
            {AMENITY_OPTIONS.map((a) => (
              <div key={a} className="flex items-center gap-2">
                <Checkbox id={`amen-${a}`} checked={form.amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
                <Label htmlFor={`amen-${a}`} className="text-sm font-normal cursor-pointer">{a}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Property Images</h3>
          <div className="flex gap-2">
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            />
            <Button type="button" variant="outline" className="gap-2 shrink-0" onClick={addImage}>
              <ImagePlus className="h-4 w-4" /> Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                  <img src={img} alt={`Property ${i + 1}`} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.3")} />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 rounded-full bg-rose-500 p-1 text-white text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" className="gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Add Property"}
          </Button>
          <Link href="/landlord/dashboard">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </DashboardLayout>
  );
}
