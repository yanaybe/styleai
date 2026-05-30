"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Upload, Sparkles, Loader2, X, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

export function ShoppingAssistantPage({ initialItems }: { initialItems: ShoppingItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [productName, setProductName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ShoppingAnalysis | null>(null);

  function handleFileSelect(f: File) {
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setCurrentAnalysis(null);
  }

  async function analyze() {
    if (!productName && !imageFile) {
      toast.error("Add a product name or photo");
      return;
    }
    setAnalyzing(true);
    try {
      let productImageUrl: string | null = null;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/upload/inspiration", { method: "POST", body: fd });
        if (upRes.ok) ({ url: productImageUrl } = await upRes.json());
      }

      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productImageUrl }),
      });

      if (!res.ok) throw new Error();
      const { item, analysis } = await res.json();
      setCurrentAnalysis(analysis);
      setItems((prev) => [item, ...prev]);
      toast.success("Analysis complete! ✨");
    } catch {
      toast.error("Analysis failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setProductName("");
    setImagePreview(null);
    setImageFile(null);
    setCurrentAnalysis(null);
  }

  const recColor = (rec: string) => {
    if (rec?.toLowerCase().includes("buy")) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (rec?.toLowerCase().includes("skip")) return "text-red-600 bg-red-50 border-red-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Shopping Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Should you buy it? AI checks if it works with your wardrobe.
        </p>
      </div>

      {/* Input */}
      <Card className="p-6 border border-border shadow-none space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Product name or description</Label>
            <Input
              placeholder="e.g. Beige linen blazer, Zara"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-10"
              onKeyDown={(e) => e.key === "Enter" && analyze()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Product photo (optional)</Label>
            <div
              className="h-10 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-all px-3"
              onClick={() => document.getElementById("shopInput")?.click()}
            >
              <input id="shopInput" type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              {imagePreview ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                    <Image src={imagePreview} alt="Product" width={24} height={24} className="object-cover" />
                  </div>
                  <span className="flex-1 truncate text-foreground text-xs">{imageFile?.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Upload photo</>
              )}
            </div>
          </div>
        </div>

        <Button onClick={analyze} disabled={analyzing || (!productName && !imageFile)} className="gap-2 shadow-rose">
          {analyzing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            : <><Sparkles className="w-4 h-4" /> Analyze this item</>}
        </Button>
      </Card>

      {/* Analysis result */}
      {currentAnalysis && (
        <Card className="p-6 border border-primary/20 bg-secondary/20 shadow-none space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold">{currentAnalysis.productName}</h3>
            </div>
            <Badge variant="outline" className={cn("border text-sm font-medium px-3 py-1 shrink-0", recColor(currentAnalysis.recommendation))}>
              {currentAnalysis.recommendation}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Outfit opportunities", value: `+${currentAnalysis.outfitOpportunities ?? 0}`, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Style match", value: `${Math.round((currentAnalysis.styleMatchScore ?? 0) * 100)}%`, icon: Sparkles, color: "text-primary" },
              { label: "Value score", value: `${Math.round((currentAnalysis.valueScore ?? 0) * 100)}%`, icon: ShoppingBag, color: "text-violet-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/60 rounded-2xl p-3 text-center">
                <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color)} />
                <p className="text-xl font-heading font-semibold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">What it goes with:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentAnalysis.matchingItems?.map((item: string) => (
                <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
              ))}
            </div>
          </div>

          {currentAnalysis.outfitIdeas?.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Outfit ideas:</p>
              <ul className="space-y-1">
                {currentAnalysis.outfitIdeas.map((idea: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✦</span> {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white/60 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{currentAnalysis.reasoning}</p>
          </div>

          <Button variant="outline" size="sm" onClick={reset}>Analyze another item</Button>
        </Card>
      )}

      {/* Past analyses */}
      {items.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Recent analyses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const analysis = item.analysis as ShoppingAnalysis | null;
              return (
                <Card key={item.id} className="p-4 border border-border hover:shadow-soft transition-all">
                  <div className="flex items-start gap-3">
                    {item.productImageUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <Image src={item.productImageUrl} alt="" width={48} height={48} className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName ?? "Item"}</p>
                      {item.outfitOpportunities != null && (
                        <p className="text-xs text-primary mt-0.5">+{item.outfitOpportunities} outfit combos</p>
                      )}
                      {analysis?.recommendation && (
                        <Badge variant="outline" className={cn("text-[10px] mt-1.5 border", recColor(analysis.recommendation))}>
                          {analysis.recommendation}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
