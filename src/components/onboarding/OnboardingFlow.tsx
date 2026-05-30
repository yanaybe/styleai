"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { STYLE_CATEGORIES, FAVORITE_COLORS } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TOTAL_STEPS = 5;

const WORK_ENVS = ["Office", "Remote / WFH", "Creative studio", "Outdoors", "Varied"];
const DRESSCODES = ["Casual", "Smart casual", "Business", "Formal"];
const FITS = ["Relaxed", "Regular", "Fitted", "Oversized"];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    country: "",
    phone: "",
    styleCategories: [] as string[],
    favoriteColors: [] as string[],
    workEnvironment: "",
    dresscode: "",
    fitPreference: "",
    modestyLevel: "",
  });

  function toggle<K extends keyof typeof form>(key: K, value: string) {
    const current = form[key] as string[];
    setForm((p) => ({
      ...p,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    }));
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function finish() {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            city: form.city,
            country: form.country,
            phone: form.phone,
            onboardingStep: TOTAL_STEPS,
            onboardingDone: true,
          }),
        }),
        fetch("/api/style-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            styleCategories: form.styleCategories,
            favoriteColors: form.favoriteColors,
            workEnvironment: form.workEnvironment,
            dresscode: form.dresscode,
            fitPreference: form.fitPreference,
            modestyLevel: form.modestyLevel,
          }),
        }),
      ]);
      router.push("/wardrobe/upload");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-heading text-xl font-semibold">StyleAI</span>
          </div>
          <p className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5 mt-3 rounded-full" />
        </div>

        <Card className="p-8 border border-border shadow-soft">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-3xl font-semibold mb-1">Nice to meet you ✨</h2>
                <p className="text-sm text-muted-foreground">Let&apos;s get to know you a little.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input
                    id="name"
                    placeholder="Sophia"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Tel Aviv"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Israel"
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Style */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-3xl font-semibold mb-1">Your style personality</h2>
                <p className="text-sm text-muted-foreground">Pick everything that feels like you.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STYLE_CATEGORIES.map((style) => {
                  const selected = form.styleCategories.includes(style);
                  return (
                    <button
                      key={style}
                      onClick={() => toggle("styleCategories", style)}
                      className={cn(
                        "px-3.5 py-2 rounded-full border text-sm font-medium transition-all",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-rose"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {selected && <Check className="inline w-3 h-3 mr-1" />}
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Colors */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-3xl font-semibold mb-1">Your color palette</h2>
                <p className="text-sm text-muted-foreground">What colors make you feel your best?</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {FAVORITE_COLORS.map((color) => {
                  const selected = form.favoriteColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggle("favoriteColors", color.name)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-all",
                        selected
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-border/30" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      {selected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Lifestyle */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-3xl font-semibold mb-1">Your lifestyle</h2>
                <p className="text-sm text-muted-foreground">Help us style you for your real life.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Work environment</p>
                  <div className="flex gap-2 flex-wrap">
                    {WORK_ENVS.map((env) => (
                      <button key={env} onClick={() => set("workEnvironment", env)}
                        className={cn("px-3 py-1.5 rounded-full border text-sm transition-all",
                          form.workEnvironment === env ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>{env}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Dress code</p>
                  <div className="flex gap-2 flex-wrap">
                    {DRESSCODES.map((code) => (
                      <button key={code} onClick={() => set("dresscode", code)}
                        className={cn("px-3 py-1.5 rounded-full border text-sm transition-all",
                          form.dresscode === code ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>{code}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Preferred fit</p>
                  <div className="flex gap-2 flex-wrap">
                    {FITS.map((fit) => (
                      <button key={fit} onClick={() => set("fitPreference", fit)}
                        className={cn("px-3 py-1.5 rounded-full border text-sm transition-all",
                          form.fitPreference === fit ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>{fit}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: WhatsApp */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-3xl font-semibold mb-1">Connect WhatsApp ✨</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI stylist will message you every morning with outfit options.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">WhatsApp number</Label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Include country code. You can also skip and connect later.</p>
              </div>
              <div className="bg-secondary/60 rounded-2xl p-4 border border-primary/15">
                <p className="text-sm font-medium mb-0.5">What to expect</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-inside">
                  <li>✨ Morning message at your preferred time</li>
                  <li>👗 Three outfit options every day</li>
                  <li>💬 Chat naturally to refine any outfit</li>
                  <li>⭐ Rate outfits to improve recommendations</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="shadow-rose gap-1.5"
                disabled={step === 1 && !form.name}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={finish} className="shadow-rose gap-1.5" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Let&apos;s go <ArrowRight className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </Card>

        {step === 5 && (
          <button
            onClick={finish}
            className="text-sm text-muted-foreground hover:text-foreground text-center w-full mt-4 transition-colors"
          >
            Skip for now — connect WhatsApp later
          </button>
        )}
      </div>
    </div>
  );
}
