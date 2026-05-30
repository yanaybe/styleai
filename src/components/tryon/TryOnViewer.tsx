"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
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

interface FlatLayItem {
  name: string;
  category: string;
  imageUrl: string;
}

interface TryOnViewerProps {
  outfitId: string;
  outfitName: string;
  items: OutfitItemData[];
  avatarUrl?: string | null;
  reasoning?: string | null;
}

const CATEGORY_ORDER = ["JACKETS", "TOPS", "DRESSES", "SKIRTS", "PANTS", "SHORTS", "SHOES", "BAGS", "JEWELRY", "ACCESSORIES"];

export function TryOnViewer({ outfitId, outfitName, items, reasoning }: TryOnViewerProps) {
  const [flatLayItems, setFlatLayItems] = useState<FlatLayItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [view, setView] = useState<"items" | "flatlay">("items");

  const sortedItems = [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.item.category);
    const bi = CATEGORY_ORDER.indexOf(b.item.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  async function generateFlatLay() {
    setGenerating(true);
    setError(null);
    try {
      const itemIds = items.map((i) => i.item.id);
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId, itemIds }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? "Failed to build outfit view";
        setError(msg);
        toast.error(msg);
        return;
      }

      setFlatLayItems(data.flatLayItems);
      setView("flatlay");
      toast.success("Outfit ready ✨");
    } catch {
      setError("Something went wrong. Try again.");
      toast.error("Failed");
    } finally {
      setGenerating(false);
    }
  }

  const currentItem = sortedItems[selectedItem];

  return (
    <div className="space-y-4">
      {/* View toggle */}
      {flatLayItems && (
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setView("items")}
            className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", view === "items" ? "bg-white shadow-sm" : "text-muted-foreground")}
          >
            Browse items
          </button>
          <button
            onClick={() => setView("flatlay")}
            className={cn("flex-1 py-1.5 text-xs font-medium rounded-lg transition-all", view === "flatlay" ? "bg-white shadow-sm" : "text-muted-foreground")}
          >
            Outfit flat-lay ✨
          </button>
        </div>
      )}

      {/* Flat-lay grid */}
      {view === "flatlay" && flatLayItems && (
        <div className="space-y-2">
          <div className={cn(
            "grid gap-2",
            flatLayItems.length === 1 ? "grid-cols-1" :
            flatLayItems.length === 2 ? "grid-cols-2" :
            flatLayItems.length === 3 ? "grid-cols-3" : "grid-cols-2"
          )}>
            {flatLayItems.map((fi, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border bg-secondary/20">
                <div className="relative aspect-square">
                  <Image src={fi.imageUrl} alt={fi.name} fill className="object-contain p-2" />
                </div>
                <div className="px-2 pb-2">
                  <p className="text-xs font-medium truncate">{fi.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fi.category.charAt(0) + fi.category.slice(1).toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">{outfitName} · {flatLayItems.length} pieces</p>
        </div>
      )}

      {/* Individual items view */}
      {view === "items" && (
        <div className="space-y-3">
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
            {selectedItem + 1} of {sortedItems.length} items · tap arrows to browse
          </p>
        </div>
      )}

      {reasoning && (
        <p className="text-xs text-muted-foreground leading-relaxed px-1 line-clamp-3">{reasoning}</p>
      )}

      <Button
        onClick={generateFlatLay}
        disabled={generating}
        className={cn("w-full gap-2 shadow-rose", flatLayItems ? "hidden" : "")}
      >
        {generating
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Building outfit view...</>
          : <><Sparkles className="w-4 h-4" /> See this outfit ✨</>}
      </Button>

      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {flatLayItems && (
        <Button onClick={generateFlatLay} disabled={generating} variant="outline" size="sm" className="w-full gap-2 text-xs">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Refresh
        </Button>
      )}
    </div>
  );
}
