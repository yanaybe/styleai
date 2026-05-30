"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HistoryRec {
  id: string;
  type: "SAFE" | "STYLISH" | "TRENDY";
  date: Date;
  rating?: string | null;
  wasWorn?: boolean | null;
  reasoning?: string | null;
  outfit?: {
    name?: string | null;
    items: Array<{ id: string; item: { name: string; thumbnailUrl?: string | null; imageUrl: string } }>;
  } | null;
}

const TYPE_CFG = {
  SAFE:    { label: "Safe",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  STYLISH: { label: "Stylish", color: "text-primary",     bg: "bg-primary/8",  border: "border-primary/20" },
  TRENDY:  { label: "Trendy",  color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
};

const RATING_DISPLAY: Record<string, string> = {
  LOVE_IT:    "❤️ Loved it",
  LIKE_IT:    "👍 Liked it",
  NOT_FOR_ME: "✗ Not for me",
};

export function OutfitHistoryPage({ recommendations }: { recommendations: HistoryRec[] }) {
  const loveCount = recommendations.filter((r) => r.rating === "LOVE_IT").length;
  const wornCount = recommendations.filter((r) => r.wasWorn).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Outfit History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {recommendations.length} outfit{recommendations.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-2xl font-heading font-semibold text-primary">{loveCount}</p>
            <p className="text-xs text-muted-foreground">loved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-semibold">{wornCount}</p>
            <p className="text-xs text-muted-foreground">worn</p>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card className="py-20 border-dashed border-2 border-primary/15 text-center">
          <History className="w-10 h-10 text-primary/25 mx-auto mb-3" />
          <p className="font-heading text-xl font-semibold mb-2">No history yet</p>
          <p className="text-sm text-muted-foreground">Generated outfits will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const cfg = TYPE_CFG[rec.type];
            return (
              <Card key={rec.id} className="p-4 border border-border hover:shadow-soft transition-all">
                <div className="flex gap-4 items-start">
                  {/* Item thumbnails */}
                  <div className="flex gap-1 shrink-0">
                    {rec.outfit?.items.slice(0, 3).map((oi) => (
                      <div key={oi.id} className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/50 relative">
                        {oi.item.thumbnailUrl ?? oi.item.imageUrl ? (
                          <Image
                            src={oi.item.thumbnailUrl ?? oi.item.imageUrl}
                            alt={oi.item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-primary/30" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {rec.outfit?.name ?? `${cfg.label} Outfit`}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px] border shrink-0", cfg.color, cfg.bg, cfg.border)}>
                        {cfg.label}
                      </Badge>
                      {rec.wasWorn && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">Worn</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(rec.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    {rec.reasoning && (
                      <p className="text-xs text-muted-foreground line-clamp-1 opacity-70">{rec.reasoning}</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="shrink-0 text-right">
                    {rec.rating ? (
                      <span className="text-xs text-muted-foreground">{RATING_DISPLAY[rec.rating]}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">Not rated</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
