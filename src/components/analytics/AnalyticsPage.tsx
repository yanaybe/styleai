"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart2, TrendingUp, TrendingDown, Star, Repeat, Sparkles } from "lucide-react";
import type { WardrobeItem } from "@/types";
import { WARDROBE_CATEGORIES } from "@/types";

interface AnalyticsPageProps {
  items: WardrobeItem[];
  recommendations: unknown[];
}

export function AnalyticsPage({ items, recommendations }: AnalyticsPageProps) {
  const totalItems = items.length;
  const totalWorn = items.reduce((sum, i) => sum + i.timesWorn, 0);
  const avgWorn = totalItems > 0 ? (totalWorn / totalItems).toFixed(1) : "0";
  const neverWorn = items.filter((i) => i.timesWorn === 0).length;
  const favorites = items.filter((i) => i.isFavorite).length;

  const mostWorn = [...items].sort((a, b) => b.timesWorn - a.timesWorn).slice(0, 5);
  const leastWorn = [...items].filter((i) => i.timesWorn === 0).slice(0, 5);

  const categoryBreakdown = WARDROBE_CATEGORIES.map((cat) => ({
    ...cat,
    count: items.filter((i) => i.category === cat.value).length,
  })).filter((c) => c.count > 0);

  const maxCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);

  const utilizationScore = totalItems > 0
    ? Math.round(((totalItems - neverWorn) / totalItems) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Wardrobe Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights about your wardrobe and styling habits</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total items", value: totalItems, icon: BarChart2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Times worn (avg)", value: avgWorn, icon: Repeat, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Never worn", value: neverWorn, icon: TrendingDown, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Utilization", value: `${utilizationScore}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border border-border shadow-none">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-heading font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Wardrobe utilization */}
      <Card className="p-6 border border-border shadow-none">
        <h2 className="font-heading text-xl font-semibold mb-1">Wardrobe utilization</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {utilizationScore}% of your wardrobe has been worn at least once
        </p>
        <Progress value={utilizationScore} className="h-3 rounded-full" />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">{totalItems - neverWorn} worn</span>
          <span className="text-xs text-muted-foreground">{neverWorn} unworn</span>
        </div>
      </Card>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-6 border border-border shadow-none">
          <h2 className="font-heading text-xl font-semibold mb-4">By category</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.value} className="flex items-center gap-3">
                <span className="text-lg w-6 shrink-0">{cat.emoji}</span>
                <span className="text-sm w-28 shrink-0">{cat.label}</span>
                <div className="flex-1">
                  <Progress value={(cat.count / maxCount) * 100} className="h-2" />
                </div>
                <span className="text-sm font-medium w-6 text-right shrink-0">{cat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Most + least worn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-6 border border-border shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-heading text-lg font-semibold">Most worn</h2>
          </div>
          {mostWorn.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start wearing items to see stats</p>
          ) : (
            <div className="space-y-3">
              {mostWorn.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.timesWorn}× worn</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border border-border shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">Hidden gems</h2>
          </div>
          {leastWorn.length === 0 ? (
            <p className="text-sm text-muted-foreground">Every item has been worn — great!</p>
          ) : (
            <div className="space-y-3">
              {leastWorn.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">Never worn</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {totalItems === 0 && (
        <Card className="p-10 border-dashed border-2 border-primary/20 text-center">
          <BarChart2 className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="font-heading text-xl font-semibold mb-2">No data yet</p>
          <p className="text-sm text-muted-foreground">Add items to your wardrobe to see analytics.</p>
        </Card>
      )}
    </div>
  );
}
