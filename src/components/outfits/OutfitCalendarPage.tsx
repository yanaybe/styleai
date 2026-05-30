"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles, ChevronLeft, ChevronRight, RefreshCw, Lock, Heart } from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const today = startOfToday();

const DAYS = Array.from({ length: 14 }, (_, i) => addDays(today, i));

export function OutfitCalendarPage({ userId }: { userId: string }) {
  const [selectedDay, setSelectedDay] = useState(today);
  const [generating, setGenerating] = useState<string | null>(null);

  async function generateForDay(date: Date) {
    setGenerating(format(date, "yyyy-MM-dd"));
    // TODO: call /api/outfits/generate
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Outfit Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Your next 14 days, styled.</p>
        </div>
        <Button className="shadow-rose gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4" />
          Generate all 14 days
        </Button>
      </div>

      {/* Day strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {DAYS.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border shrink-0 transition-all min-w-[56px]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-rose"
                  : isToday
                  ? "border-primary/40 bg-secondary"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <span className="text-[10px] font-medium uppercase opacity-70">
                {format(day, "EEE")}
              </span>
              <span className="text-lg font-heading font-semibold leading-none">
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Safe", "Stylish", "Trendy"].map((type, i) => (
          <Card key={type} className="border border-border overflow-hidden hover:shadow-soft transition-all">
            <div className={cn(
              "h-1",
              type === "Safe" ? "bg-emerald-400" : type === "Stylish" ? "bg-primary" : "bg-violet-400"
            )} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] border",
                    type === "Safe" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    type === "Stylish" ? "bg-primary/10 text-primary border-primary/20" :
                    "bg-violet-50 text-violet-600 border-violet-200"
                  )}
                >
                  {type}
                </Badge>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors">
                    <Heart className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Outfit placeholder */}
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-secondary/80 to-muted/50 mb-4 flex items-center justify-center">
                {generating === format(selectedDay, "yyyy-MM-dd") ? (
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-primary/40 animate-pulse mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Styling...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No outfit yet</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => generateForDay(selectedDay)}
                disabled={!!generating}
              >
                <RefreshCw className={cn("w-3 h-3", generating && "animate-spin")} />
                Generate outfit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state hint */}
      <Card className="p-6 border-dashed border-2 border-primary/15 text-center">
        <Calendar className="w-8 h-8 text-primary/30 mx-auto mb-3" />
        <p className="font-heading text-lg font-semibold mb-1">Plan ahead with AI</p>
        <p className="text-sm text-muted-foreground">
          Select a day above and generate outfit options. Your AI stylist will pick from your wardrobe and the forecast.
        </p>
      </Card>
    </div>
  );
}
