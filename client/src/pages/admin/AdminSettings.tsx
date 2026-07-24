import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import DashboardLayout, { navIcons } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleSave = () => {
    saveSettings(settings);
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout navItems={navItems} title="Settings" activePath="/admin/settings">
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => setSettings({ ...settings, currency: v as "KES" | "USD" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <SettingsIcon className="h-4 w-4" /> Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
