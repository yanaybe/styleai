"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Upload, Sparkles, Loader2, X,
  TrendingUp, AlertCircle, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Store { name: string; url: string; why: string }
interface Suggestion { name: string; description: string; priceRange: string; stores: Store[] }
interface Gap {
  category: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  suggestions: Suggestion[];
}
interface GapAnalysis {
  gaps: Gap[];
  summary: string;
  season: string;
  nextSeason: string;
}

interface ShoppingAnalysis {
  productName: string;
  outfitOpportunities: number;
  styleMatchScore: number;
  valueScore: number;
  matchingItems: string[];
  outfitIdeas: string[];
  recommendation: string;
  reasoning: string;
}
interface ShoppingItem {
  id: string;
  productName?: string | null;
  productImageUrl?: string | null;
  outfitOpportunities?: number | null;
  styleMatchScore?: number | null;
  valueScore?: number | null;
  analysis: ShoppingAnalysis | null;
}

const URGENCY_CFG = {
  high:   { label: "Need now",    color: "text-rose-600 bg-rose-50 border-rose-200" },
  medium: { label: "Soon",        color: "text-amber-600 bg-amber-50 border-amber-200" },
  low:    { label: "Nice to have",color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

const REC_COLOR = (r: string) => {
  if (r?.toLowerCase().includes("buy"))  return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (r?.toLowerCase().includes("skip")) return "text-red-600 bg-red-50 border-red-200";
  return "text-amber-600 bg-amber-50 border-amber-200";
};

const SEASON_EMOJI: Record<string, string> = {
  spring: "🌸", summer: "☀️", fall: "🍂", winter: "❄️",
};

export function ShoppingAssistantPage({ initialItems }: { initialItems: ShoppingItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [productName, setProductName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ShoppingAnalysis | null>(null);
  const [gaps, setGaps] = useState<GapAnalysis | null>(null);
  const [gapsLoading, setGapsLoading] = useState(true);
  const [expandedGap, setExpandedGap] = useState<number | null>(0);

  useEffect(() => {
    loadGaps();
  }, []);

  async function loadGaps() {
    setGapsLoading(true);
    try {
      const res = await fetch("/api/shopping/gaps");
      if (res.ok) setGaps(await res.json());
    } catch {}
    finally { setGapsLoading(false); }
  }

  function handleFileSelect(f: File) {
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setCurrentAnalysis(null);
  }

  async function analyze() {
    if (!productName && !imageFile) { toast.error("Add a product name or photo"); return; }
    setAnalyzing(true);
    try {
      let productImageUrl: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch("/api/upload/inspiration", { method: "POST", body: fd });
        if (up.ok) ({ url: productImageUrl } = await up.json());
      }
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productImageUrl }),
      });
      if (!res.ok) throw new Error();
      const { item, analysis } = await res.json();
      setCurrentAnalysis(analysis);
      setItems((p) => [item, ...p]);
      toast.success("Analysis done! ✨");
    } catch { toast.error("Analysis failed. Try again."); }
    finally { setAnalyzing(false); }
  }

  function reset() {
    setProductName(""); setImagePreview(null);
    setImageFile(null); setCurrentAnalysis(null);
  }

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Shopping</h1>
        <p className="text-sm text-muted-foreground mt-1">What Talia&apos;s wardrobe is missing right now.</p>
      </div>

      {/* GAP ANALYSIS — hero section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
            {gaps ? `${SEASON_EMOJI[gaps.season] ?? "✨"} ${gaps.season.charAt(0).toUpperCase() + gaps.season.slice(1)} gaps` : "Wardrobe gaps"}
          </h2>
          <button onClick={loadGaps} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Refresh
          </button>
        </div>

        {gapsLoading ? (
          <Card className="p-8 border border-border shadow-none flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Analyzing your wardrobe...</p>
          </Card>
        ) : gaps?.gaps?.length ? (
          <div className="space-y-2">
            {gaps.summary && (
              <p className="text-sm text-muted-foreground px-1 mb-3">{gaps.summary}</p>
            )}
            {gaps.gaps.map((gap, i) => {
              const cfg = URGENCY_CFG[gap.urgency] ?? URGENCY_CFG.medium;
              const isOpen = expandedGap === i;
              return (
                <Card key={i} className={cn("border overflow-hidden transition-all", isOpen ? "border-primary/30 shadow-soft" : "border-border")}>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedGap(isOpen ? null : i)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-sm">{gap.category}</span>
                        <Badge variant="outline" className={cn("text-[10px] border shrink-0", cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{gap.reason}</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isOpen && gap.suggestions?.length > 0 && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                      {gap.suggestions.map((sug, j) => (
                        <div key={j} className="bg-secondary/30 rounded-2xl p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-medium text-sm">{sug.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{sug.description}</p>
                            </div>
                            <span className="text-xs font-medium text-primary whitespace-nowrap">{sug.priceRange}</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {sug.stores?.map((store) => (
                              <a
                                key={store.name}
                                href={store.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-border text-xs font-medium hover:border-primary/40 hover:shadow-sm transition-all"
                              >
                                {store.name}
                                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 border border-border shadow-none text-center">
            <Sparkles className="w-6 h-6 text-primary/30 mx-auto mb-2" />
            <p className="text-sm font-medium">Add more items to your wardrobe first</p>
            <p className="text-xs text-muted-foreground mt-1">I&apos;ll analyze what&apos;s missing once you have some clothes added.</p>
          </Card>
        )}
      </div>

      {/* ANALYZE AN ITEM */}
      <div>
        <h2 className="font-heading text-xl font-semibold mb-3">Thinking of buying something?</h2>
        <Card className="p-4 border border-border shadow-none space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Product name</Label>
              <Input placeholder="e.g. Beige linen blazer, Zara" value={productName}
                onChange={(e) => setProductName(e.target.value)} className="h-10 text-sm"
                onKeyDown={(e) => e.key === "Enter" && analyze()} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Photo</Label>
              <div
                className="h-10 w-20 border border-dashed border-border rounded-xl flex items-center justify-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => document.getElementById("shopInput")?.click()}
              >
                <input id="shopInput" type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {imagePreview
                  ? <Image src={imagePreview} alt="" width={32} height={32} className="object-cover rounded-lg" />
                  : <Upload className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          <Button onClick={analyze} disabled={analyzing || (!productName && !imageFile)} className="gap-2 shadow-rose w-full sm:w-auto">
            {analyzing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
              : <><Sparkles className="w-4 h-4" /> Should I buy it?</>}
          </Button>
        </Card>

        {/* Analysis result */}
        {currentAnalysis && (
          <Card className="mt-3 p-4 border border-primary/20 bg-secondary/20 shadow-none space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold leading-tight">{currentAnalysis.productName}</h3>
              <Badge variant="outline" className={cn("border text-xs font-medium px-2.5 py-1 shrink-0", REC_COLOR(currentAnalysis.recommendation))}>
                {currentAnalysis.recommendation}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "New outfits",   value: `+${currentAnalysis.outfitOpportunities ?? 0}`, icon: TrendingUp, color: "text-emerald-600" },
                { label: "Style match",   value: `${Math.round((currentAnalysis.styleMatchScore ?? 0) * 100)}%`, icon: Sparkles, color: "text-primary" },
                { label: "Value score",   value: `${Math.round((currentAnalysis.valueScore ?? 0) * 100)}%`, icon: ShoppingBag, color: "text-violet-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white/60 rounded-xl p-2.5 text-center">
                  <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", s.color)} />
                  <p className="text-lg font-heading font-semibold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {currentAnalysis.matchingItems?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5">Goes with in your closet:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentAnalysis.matchingItems.map((item: string) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {currentAnalysis.outfitIdeas?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5">Outfit ideas:</p>
                <ul className="space-y-1">
                  {currentAnalysis.outfitIdeas.map((idea: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0">✦</span> {idea}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 bg-white/60 rounded-xl p-3">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{currentAnalysis.reasoning}</p>
            </div>

            <Button variant="outline" size="sm" onClick={reset} className="text-xs">Analyze another</Button>
          </Card>
        )}
      </div>

      {/* Past analyses */}
      {items.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold mb-3">Past checks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.slice(0, 6).map((item) => {
              const a = item.analysis;
              return (
                <Card key={item.id} className="p-3 border border-border hover:shadow-soft transition-all flex items-center gap-3">
                  {item.productImageUrl && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      <Image src={item.productImageUrl} alt="" width={40} height={40} className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName ?? "Item"}</p>
                    {item.outfitOpportunities != null && (
                      <p className="text-xs text-primary">+{item.outfitOpportunities} new outfits</p>
                    )}
                  </div>
                  {a?.recommendation && (
                    <Badge variant="outline" className={cn("text-[10px] shrink-0 border", REC_COLOR(a.recommendation))}>
                      {a.recommendation}
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
