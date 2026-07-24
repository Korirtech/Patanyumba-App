import { useState } from "react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: navIcons.dashboard },
  { href: "/admin/users", label: "Users", icon: navIcons.users },
  { href: "/admin/properties", label: "Properties", icon: navIcons.properties },
  { href: "/admin/settings", label: "Settings", icon: navIcons.settings },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(getSettings());
  const [currency, setCurrency] = useState(settings.currency);
  const [logo, setLogo] = useState(settings.logo);

  const handleSave = () => {
    const updated = { ...settings, currency, logo };
    saveSettings(updated);
    setSettings(updated);
    toast.success("Settings saved successfully!");
  };

  return (
    <DashboardLayout navItems={navItems} title="Admin Settings" activePath="/admin/settings">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage application settings and preferences.</p>
        </div>

        {/* Currency */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display font-semibold mb-4">Currency</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={currency === "KES" ? "default" : "outline"}
                onClick={() => setCurrency("KES")}
                className={currency === "KES" ? "bg-primary" : ""}
              >
                KES (KSh)
              </Button>
              <Button
                variant={currency === "USD" ? "default" : "outline"}
                onClick={() => setCurrency("USD")}
                className={currency === "USD" ? "bg-primary" : ""}
              >
                USD ($)
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Current: {currency === "KES" ? "Kenyan Shilling (KSh)" : "US Dollar ($)"}
          </p>
        </div>

        {/* Logo */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display font-semibold mb-4">Logo</h3>
          <div className="space-y-3">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
            {logo && (
              <div className="flex items-center gap-3 mt-2">
                <img src={logo} alt="Logo preview" className="h-10 w-10 object-contain rounded" />
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} className="gap-2">
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
