"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, RefreshCw, Cloud, Thermometer } from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TryOnViewer } from "@/components/tryon/TryOnViewer";

const today = startOfToday();
const DAYS = Array.from({ length: 14 }, (_, i) => addDays(today, i));

type RatingType = "LOVE_IT" | "LIKE_IT" | "NOT_FOR_ME";

interface OutfitItem {
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

interface Recommendation {
  id: string;
  type: "SAFE" | "STYLISH" | "TRENDY";
  reasoning: string;
  confidenceScore: number;
  rating?: RatingType;
  wasWorn?: boolean;
  outfit: {
    id: string;
    name: string;
    items: OutfitItem[];
  };
}

interface WeatherData {
  temp: number;
  description: string;
  precipitationProbability: number;
}

const TYPE_CONFIG = {
  SAFE:    { label: "Safe",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-400" },
  STYLISH: { label: "Stylish", color: "text-primary",     bg: "bg-primary/8",  border: "border-primary/20", bar: "bg-primary" },
  TRENDY:  { label: "Trendy",  color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200", bar: "bg-violet-400" },
};

interface OutfitCalendarPageProps {
  userId: string;
  avatarUrl?: string | null;
}

export function OutfitCalendarPage({ userId, avatarUrl }: OutfitCalendarPageProps) {
  const [selectedDay, setSelectedDay] = useState(today);
  const [generating, setGenerating] = useState(false);
  const [eventDescription, setEventDescription] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dayCache, setDayCache] = useState<Record<string, Recommendation[]>>({});
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const dayKey = format(selectedDay, "yyyy-MM-dd");

  const loadDay = useCallback((day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    if (dayCache[key]) setRecommendations(dayCache[key]);
    else setRecommendations([]);
  }, [dayCache]);

  function selectDay(day: Date) {
    setSelectedDay(day);
    loadDay(day);
  }

  async function generateOutfits() {
    setGenerating(true);
    try {
      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDay.toISOString(), eventDescription }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to generate"); return; }

      setRecommendations(data.recommendations);
      setWeather(data.weather);
      setDayCache((prev) => ({ ...prev, [dayKey]: data.recommendations }));
      toast.success("3 outfits ready ✨");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function rateOutfit(recId: string, rating: RatingType, wasWorn?: boolean) {
    setRatingLoading(recId);
    try {
      const res = await fetch("/api/outfits/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: recId, rating, wasWorn }),
      });
      if (!res.ok) throw new Error();
      setRecommendations((prev) => prev.map((r) => r.id === recId ? { ...r, rating, wasWorn } : r));
      setDayCache((prev) => ({
        ...prev,
        [dayKey]: (prev[dayKey] ?? []).map((r) => r.id === recId ? { ...r, rating, wasWorn } : r),
      }));
      const labels: Record<RatingType, string> = { LOVE_IT: "Loved it! ❤️", LIKE_IT: "Liked it!", NOT_FOR_ME: "Noted 👍" };
      toast.success(labels[rating]);
    } catch {
      toast.error("Failed to save rating");
    } finally {
      setRatingLoading(null);
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Outfit Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">AI picks outfits from your closet — try them on yourself.</p>
        </div>
      </div>

      {/* Day strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const key = format(day, "yyyy-MM-dd");
          const hasOutfits = !!dayCache[key]?.length;
          return (
            <button
              key={day.toISOString()}
              onClick={() => selectDay(day)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl border shrink-0 transition-all min-w-[52px]",
                isSelected ? "bg-primary text-primary-foreground border-primary shadow-rose"
                  : isToday ? "border-primary/40 bg-secondary"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <span className="text-[9px] font-medium uppercase opacity-70">{format(day, "EEE")}</span>
              <span className="text-base font-heading font-semibold leading-none">{format(day, "d")}</span>
              {hasOutfits && !isSelected && <span className="w-1 h-1 rounded-full bg-primary/60" />}
            </button>
          );
        })}
      </div>

      {/* Generate panel */}
      <Card className="p-4 border border-border shadow-none">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{format(selectedDay, "EEEE, MMMM d")}</p>
            <Input
              placeholder="Any plans? (work meeting, date night, gym...)"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="h-10"
              onKeyDown={(e) => e.key === "Enter" && generateOutfits()}
            />
          </div>
          <Button onClick={generateOutfits} disabled={generating}
            className="shadow-rose gap-2 shrink-0 w-full sm:w-auto">
            {generating
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Styling...</>
              : <><Sparkles className="w-4 h-4" /> Generate outfits</>}
          </Button>
        </div>

        {weather && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{weather.temp}°C</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Cloud className="w-3.5 h-3.5" />
              <span>{weather.description}</span>
            </div>
            {weather.precipitationProbability > 30 && (
              <Badge variant="secondary" className="text-xs">{weather.precipitationProbability}% rain</Badge>
            )}
          </div>
        )}
      </Card>

      {/* Outfit cards with try-on */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            const cfg = TYPE_CONFIG[rec.type];
            return (
              <Card key={rec.id} className="border border-border overflow-hidden">
                <div className={cn("h-1", cfg.bar)} />
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("text-xs border font-medium", cfg.color, cfg.bg, cfg.border)}>
                      {cfg.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((rec.confidenceScore ?? 0.8) * 100)}% match
                    </span>
                  </div>

                  <p className="font-heading text-lg font-semibold leading-tight">
                    {rec.outfit?.name ?? `${cfg.label} Outfit`}
                  </p>

                  {/* TryOn viewer — items + virtual try-on */}
                  <TryOnViewer
                    outfitId={rec.outfit?.id ?? rec.id}
                    outfitName={rec.outfit?.name ?? `${cfg.label} Outfit`}
                    items={rec.outfit?.items ?? []}
                    avatarUrl={avatarUrl}
                    reasoning={rec.reasoning}
                  />

                  {/* Rating */}
                  <div className="pt-3 border-t border-border">
                    {rec.rating ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {rec.rating === "LOVE_IT" ? "❤️ Loved it" : rec.rating === "LIKE_IT" ? "👍 Liked it" : "✗ Not for me"}
                        </span>
                        {rec.wasWorn && <Badge variant="secondary" className="text-[10px]">Worn</Badge>}
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">How was it?</p>
                        <div className="flex gap-1.5">
                          {([
                            { rating: "LOVE_IT" as RatingType, label: "❤️" },
                            { rating: "LIKE_IT" as RatingType, label: "👍" },
                            { rating: "NOT_FOR_ME" as RatingType, label: "✗" },
                          ]).map(({ rating, label }) => (
                            <button
                              key={rating}
                              onClick={() => rateOutfit(rec.id, rating, rating === "LOVE_IT")}
                              disabled={ratingLoading === rec.id}
                              className="flex-1 py-1.5 rounded-lg border border-border text-sm hover:border-primary/40 hover:bg-secondary/50 transition-all disabled:opacity-50"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-14 border-dashed border-2 border-primary/15 text-center px-6">
          <Sparkles className="w-9 h-9 text-primary/25 mx-auto mb-3" />
          <p className="font-heading text-xl font-semibold mb-2">No outfits yet for this day</p>
          <p className="text-sm text-muted-foreground">
            Enter your plans above and tap Generate — I&apos;ll pick 3 outfits from your wardrobe.
          </p>
        </Card>
      )}
    </div>
  );
}
