"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, User, Bell, Shield, Loader2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SettingsPageProps {
  user: { email: string; id: string };
  profile: {
    name?: string | null;
    phone?: string | null;
    whatsappVerified?: boolean;
    morningTime?: string;
    city?: string | null;
    country?: string | null;
  } | null;
}

export function SettingsPage({ user, profile }: SettingsPageProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    morningTime: profile?.morningTime ?? "07:00",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
  });

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6 border border-border shadow-none space-y-5">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email} disabled className="h-10 bg-muted/50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                placeholder="Tel Aviv"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                placeholder="Israel"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* WhatsApp */}
      <Card className="p-6 border border-border shadow-none space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-xl font-semibold">WhatsApp</h2>
          </div>
          {profile?.whatsappVerified ? (
            <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp number</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 234 567 8900"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Include country code (e.g. +1, +44, +972)</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="morningTime">Morning message time</Label>
            <Input
              id="morningTime"
              type="time"
              value={form.morningTime}
              onChange={(e) => setForm((p) => ({ ...p, morningTime: e.target.value }))}
              className="h-10 w-36"
            />
          </div>

          {!profile?.whatsappVerified && (
            <div className="gradient-rose rounded-xl p-4 border border-primary/20">
              <p className="text-sm font-medium mb-1">To connect WhatsApp:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Save your number above</li>
                <li>Send &ldquo;hello&rdquo; to our WhatsApp number</li>
                <li>Your stylist will introduce herself ✨</li>
              </ol>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "14155238886"}?text=hello`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-3 hover:underline"
              >
                Open WhatsApp
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 border border-border shadow-none space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Morning outfit suggestions", description: "Daily WhatsApp message with outfit options", enabled: true },
            { label: "Weekly style recap", description: "Sunday summary of your week's outfits", enabled: true },
            { label: "Seasonal wardrobe tips", description: "Alerts when seasons change", enabled: false },
          ].map((notif) => (
            <div key={notif.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{notif.label}</p>
                <p className="text-xs text-muted-foreground">{notif.description}</p>
              </div>
              <button className={`w-10 h-5 rounded-full transition-colors ${notif.enabled ? "bg-primary" : "bg-muted"} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notif.enabled ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 border border-border shadow-none space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Privacy & Security</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Your wardrobe data and photos are private and never used to train AI models without your consent.</p>
          <p>All images are stored securely and can be deleted at any time.</p>
        </div>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5">
          Delete my account
        </Button>
      </Card>

      <Button onClick={saveProfile} className="w-full h-11 shadow-rose" disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save settings"}
      </Button>
    </div>
  );
}
