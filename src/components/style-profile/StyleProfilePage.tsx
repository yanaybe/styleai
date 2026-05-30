"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STYLE_CATEGORIES, FAVORITE_COLORS } from "@/types";
import type { StyleProfile } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Palette, Sparkles, Check } from "lucide-react";

interface StyleProfilePageProps {
  initialProfile: StyleProfile | null;
}

export function StyleProfilePage({ initialProfile }: StyleProfilePageProps) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    favoriteColors: initialProfile?.favoriteColors ?? [],
    favoriteBrands: initialProfile?.favoriteBrands ?? [],
    styleCategories: initialProfile?.styleCategories ?? [],
    workEnvironment: initialProfile?.workEnvironment ?? "",
    dresscode: initialProfile?.dresscode ?? "",
    fitPreference: initialProfile?.fitPreference ?? "",
    modestyLevel: initialProfile?.modestyLevel ?? "",
    pinterestUrl: initialProfile?.pinterestUrl ?? "",
    instagramHandle: initialProfile?.instagramHandle ?? "",
  });

  function toggleColor(color: string) {
    setProfile((p) => ({
      ...p,
      favoriteColors: p.favoriteColors.includes(color)
        ? p.favoriteColors.filter((c) => c !== color)
        : [...p.favoriteColors, color],
    }));
  }

  function toggleStyle(style: string) {
    setProfile((p) => ({
      ...p,
      styleCategories: p.styleCategories.includes(style)
        ? p.styleCategories.filter((s) => s !== style)
        : [...p.styleCategories, style],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/style-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error();
      toast.success("Style profile saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Style Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The more you tell us, the better your outfit recommendations.
        </p>
      </div>

      {/* Favorite colors */}
      <Card className="p-6 border border-border shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Favorite colors</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {FAVORITE_COLORS.map((color) => {
            const selected = profile.favoriteColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all",
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border/50"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
                {selected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Style categories */}
      <Card className="p-6 border border-border shadow-none">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Your style</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLE_CATEGORIES.map((style) => {
            const selected = profile.styleCategories.includes(style);
            return (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-all",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {style}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Work + fit */}
      <Card className="p-6 border border-border shadow-none space-y-4">
        <h2 className="font-heading text-xl font-semibold">Your lifestyle</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Work environment</Label>
            <div className="flex gap-2 flex-wrap">
              {["Office", "Remote / WFH", "Creative studio", "Outdoors"].map((env) => (
                <button
                  key={env}
                  onClick={() => setProfile((p) => ({ ...p, workEnvironment: env }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all",
                    profile.workEnvironment === env
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dress code</Label>
            <div className="flex gap-2 flex-wrap">
              {["Casual", "Smart casual", "Business", "Formal"].map((code) => (
                <button
                  key={code}
                  onClick={() => setProfile((p) => ({ ...p, dresscode: code }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all",
                    profile.dresscode === code
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred fit</Label>
            <div className="flex gap-2 flex-wrap">
              {["Relaxed", "Regular", "Fitted", "Oversized"].map((fit) => (
                <button
                  key={fit}
                  onClick={() => setProfile((p) => ({ ...p, fitPreference: fit }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all",
                    profile.fitPreference === fit
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Modesty preference</Label>
            <div className="flex gap-2 flex-wrap">
              {["Minimal", "Moderate", "Modest", "Very modest"].map((level) => (
                <button
                  key={level}
                  onClick={() => setProfile((p) => ({ ...p, modestyLevel: level }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-all",
                    profile.modestyLevel === level
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Social inspirations */}
      <Card className="p-6 border border-border shadow-none space-y-4">
        <h2 className="font-heading text-xl font-semibold">Inspiration accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pinterest">Pinterest URL</Label>
            <Input
              id="pinterest"
              placeholder="https://pinterest.com/yourboard"
              value={profile.pinterestUrl}
              onChange={(e) => setProfile((p) => ({ ...p, pinterestUrl: e.target.value }))}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram handle</Label>
            <Input
              id="instagram"
              placeholder="@yourusername"
              value={profile.instagramHandle}
              onChange={(e) => setProfile((p) => ({ ...p, instagramHandle: e.target.value }))}
              className="h-10"
            />
          </div>
        </div>
      </Card>

      <Button onClick={save} className="w-full h-11 shadow-rose" disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save style profile"}
      </Button>
    </div>
  );
}
