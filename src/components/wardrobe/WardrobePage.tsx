"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Heart,
  Trash2,
  Sparkles,
  Grid3X3,
  List,
} from "lucide-react";
import { WARDROBE_CATEGORIES } from "@/types";
import type { WardrobeItem, WardrobeCategory } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface WardrobePageProps {
  items: WardrobeItem[];
  userId: string;
}

const categoryColors: Record<WardrobeCategory, string> = {
  TOPS: "bg-rose-50 text-rose-600 border-rose-100",
  PANTS: "bg-blue-50 text-blue-600 border-blue-100",
  SHORTS: "bg-sky-50 text-sky-600 border-sky-100",
  SKIRTS: "bg-pink-50 text-pink-600 border-pink-100",
  DRESSES: "bg-violet-50 text-violet-600 border-violet-100",
  JACKETS: "bg-amber-50 text-amber-600 border-amber-100",
  SHOES: "bg-emerald-50 text-emerald-600 border-emerald-100",
  BAGS: "bg-orange-50 text-orange-600 border-orange-100",
  JEWELRY: "bg-yellow-50 text-yellow-600 border-yellow-100",
  ACCESSORIES: "bg-teal-50 text-teal-600 border-teal-100",
};

export function WardrobePage({ items }: WardrobePageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [localItems, setLocalItems] = useState(items);

  const filtered = localItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  async function toggleFavorite(itemId: string) {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i))
    );

    const res = await fetch(`/api/wardrobe/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !localItems.find((i) => i.id === itemId)?.isFavorite }),
    });

    if (!res.ok) toast.error("Failed to update");
  }

  async function deleteItem(itemId: string) {
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));

    const res = await fetch(`/api/wardrobe/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete");
      setLocalItems(items);
    } else {
      toast.success("Item removed from closet");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold">My Closet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {localItems.length} item{localItems.length !== 1 ? "s" : ""} in your wardrobe
          </p>
        </div>
        <Link href="/wardrobe/upload">
          <Button className="shadow-rose gap-2">
            <Plus className="w-4 h-4" />
            Add item
          </Button>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or brand..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "secondary" : "outline"}
            size="icon"
            className="w-10 h-10"
            onClick={() => setView("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "outline"}
            size="icon"
            className="w-10 h-10"
            onClick={() => setView("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
            activeCategory === "ALL"
              ? "bg-primary text-primary-foreground border-primary shadow-rose"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          All ({localItems.length})
        </button>
        {WARDROBE_CATEGORIES.map((cat) => {
          const count = localItems.filter((i) => i.category === cat.value).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary shadow-rose"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <Card className="py-20 border-dashed border-2 border-primary/20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary/40" />
          </div>
          <p className="font-heading text-xl font-semibold mb-2">No items found</p>
          <p className="text-sm text-muted-foreground mb-5">
            {localItems.length === 0
              ? "Start uploading your wardrobe to get AI outfit recommendations."
              : "Try a different search or category filter."}
          </p>
          <Link href="/wardrobe/upload">
            <Button className="shadow-rose gap-2">
              <Plus className="w-4 h-4" />
              Add your first item
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-3"
          )}
        >
          {filtered.map((item) => (
            <div key={item.id} className={view === "list" ? "flex gap-4 bg-card border border-border rounded-2xl p-3 hover:shadow-soft transition-all" : ""}>
              <div
                className={cn(
                  "relative group",
                  view === "grid" ? "rounded-2xl overflow-hidden border border-border bg-card hover:shadow-soft transition-all" : "w-20 h-20 rounded-xl overflow-hidden shrink-0"
                )}
              >
                {item.imageUrl ? (
                  <div className={cn("relative", view === "grid" ? "aspect-square" : "w-full h-full")}>
                    <Image
                      src={item.thumbnailUrl ?? item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={cn("bg-secondary/50 flex items-center justify-center", view === "grid" ? "aspect-square" : "w-full h-full")}>
                    <Sparkles className="w-8 h-8 text-primary/20" />
                  </div>
                )}

                {view === "grid" && (
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all">
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={cn("w-3.5 h-3.5", item.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")}
                        />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  </div>
                )}

                {view === "grid" && (
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.brand && <p className="text-xs text-muted-foreground truncate">{item.brand}</p>}
                    <Badge
                      variant="outline"
                      className={cn("mt-1.5 text-[10px] h-4 px-1.5 border", categoryColors[item.category])}
                    >
                      {WARDROBE_CATEGORIES.find((c) => c.value === item.category)?.label}
                    </Badge>
                  </div>
                )}
              </div>

              {view === "list" && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] h-4 px-1.5 border", categoryColors[item.category])}
                        >
                          {WARDROBE_CATEGORIES.find((c) => c.value === item.category)?.label}
                        </Badge>
                        {item.colorPrimary && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {item.colorPrimary}
                          </Badge>
                        )}
                        {item.formalityLevel && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {item.formalityLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-muted-foreground">{item.timesWorn}× worn</p>
                      <button onClick={() => toggleFavorite(item.id)}>
                        <Heart className={cn("w-4 h-4", item.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
                      </button>
                      <button onClick={() => deleteItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
