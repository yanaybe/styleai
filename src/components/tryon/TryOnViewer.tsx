"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, User, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OutfitItemData {
  id: string;
  item: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    colorPrimary?: string | null;
    brand?: string | null;
  };
}

interface TryOnViewerProps {
  outfitId: string;
  outfitName: string;
  items: OutfitItemData[];
  avatarUrl?: string | null;
  reasoning?: string | null;
}

const CATEGORY_ORDER = ["JACKETS", "TOPS", "DRESSES", "SKIRTS", "PANTS", "SHORTS", "SHOES", "BAGS", "JEWELRY", "ACCESSORIES"];

export function TryOnViewer({ outfitId, outfitName, items, avatarUrl, reasoning }: TryOnViewerProps) {
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [view, setView] = useState<"items" | "tryon">("items");

  const sortedItems = [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.item.category);
    const bi = CATEGORY_ORDER.indexOf(b.item.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  async function generateTryOn() {
    if (!avatarUrl) {
      toast.error("Upload your full-body photo in the 'Me' tab first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const itemIds = items.map((i) => i.item.id);
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId, avatarUrl, itemIds }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Try-on failed");
        toast.error(data.error ?? "Try-on failed");
        return;
      }

      setTryOnUrl(data.tryOnUrl);
      setView("tryon");
      toast.success("Try-on ready! ✨");
    } catch {
      setError("Something went wrong. Try again.");
      toast.error("Try-on failed");
    } finally {
      setGenerating(false);
    }
  }

  const currentItem = sortedItems[selectedItem];

  return (
    <div className="space-y-4">
      {/* View toggle */}
      {tryOnUrl && (
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setView("items")}
            className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", view === "items" ? "bg-white shadow-sm" : "text-muted-foreground")}
          >
            Individual items
          </button>
          <button
            onClick={() => setView("tryon")}
            className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", view === "tryon" ? "bg-white shadow-sm" : "text-muted-foreground")}
          >
            Try-on ✨
          </button>
        </div>
      )}

      {/* Try-on view */}
      {view === "tryon" && tryOnUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-soft">
          <Image
            src={tryOnUrl}
            alt="Virtual try-on"
            width={400}
            height={600}
            className="w-full object-cover"
            style={{ aspectRatio: "2/3" }}
          />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2">
              <p className="text-xs font-medium">{outfitName}</p>
              <p className="text-[10px] text-muted-foreground">You look stunning, Talia ✨</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual items view */}
      {view === "items" && (
        <div className="space-y-3">
          {/* Big selected item */}
          {currentItem && (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/20">
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                <Image
                  src={currentItem.item.imageUrl}
                  alt={currentItem.item.name}
                  fill
                  className="object-contain p-3"
                />
              </div>
              <div className="p-3 border-t border-border">
                <p className="font-medium text-sm">{currentItem.item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {currentItem.item.category.charAt(0) + currentItem.item.category.slice(1).toLowerCase()}
                  </Badge>
                  {currentItem.item.colorPrimary && (
                    <span className="text-[10px] text-muted-foreground">{currentItem.item.colorPrimary}</span>
                  )}
                  {currentItem.item.brand && (
                    <span className="text-[10px] text-muted-foreground">· {currentItem.item.brand}</span>
                  )}
                </div>
              </div>

              {/* Navigation arrows */}
              {sortedItems.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedItem((p) => (p - 1 + sortedItems.length) % sortedItems.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItem((p) => (p + 1) % sortedItems.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Item strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sortedItems.map((oi, i) => (
              <button
                key={oi.id}
                onClick={() => setSelectedItem(i)}
                className={cn(
                  "shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                  selectedItem === i ? "border-primary shadow-rose" : "border-border"
                )}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={oi.item.thumbnailUrl ?? oi.item.imageUrl}
                    alt={oi.item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {selectedItem + 1} of {sortedItems.length} items · tap arrows or thumbnails to browse
          </p>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <p className="text-xs text-muted-foreground leading-relaxed px-1 line-clamp-3">{reasoning}</p>
      )}

      {/* Try-on button */}
      {!tryOnUrl && (
        <div className="space-y-2">
          {!avatarUrl ? (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-700">Upload your photo first</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Go to the &quot;Me&quot; tab in the menu to add your full-body photo.</p>
                <Link href="/avatar" className="text-[10px] text-primary underline mt-1 block">Upload photo →</Link>
              </div>
            </div>
          ) : (
            <Button
              onClick={generateTryOn}
              disabled={generating}
              className="w-full gap-2 shadow-rose"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Dressing you up...</>
                : <><User className="w-4 h-4" /> Try this on me ✨</>}
            </Button>
          )}

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>
      )}

      {tryOnUrl && (
        <Button
          onClick={generateTryOn}
          disabled={generating}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Regenerate try-on
        </Button>
      )}
    </div>
  );
}
