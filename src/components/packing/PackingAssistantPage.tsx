"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Luggage, Sparkles, Loader2, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ACTIVITIES = ["Beach", "City walks", "Business meetings", "Hiking", "Dining out", "Nightlife", "Gym", "Day trips"];

interface DayOutfit {
  name: string;
  itemIds: string[];
  occasion: string;
}

interface PackingDay {
  day: number;
  date: string;
  dayOutfit: DayOutfit;
  eveningOutfit?: DayOutfit;
}

interface PackingPlan {
  packingList: PackingDay[];
  mustPackItems: string[];
  tips: string[];
  totalItemCount: number;
}

interface PackingList {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  activities: string[];
}

export function PackingAssistantPage({ initialLists }: { initialLists: PackingList[] }) {
  const [lists, setLists] = useState(initialLists);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<PackingPlan | null>(null);

  function toggleActivity(a: string) {
    setActivities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  async function generatePlan() {
    if (!destination || !startDate || !endDate) {
      toast.error("Fill in destination and dates");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate, endDate, activities }),
      });
      if (!res.ok) throw new Error();
      const { list, plan: newPlan } = await res.json();
      setPlan(newPlan);
      setLists((prev) => [list, ...prev]);
      toast.success(`Packing plan for ${destination} ready! ✈️`);
    } catch {
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Packing Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us where you&apos;re going — AI plans your entire trip wardrobe.
        </p>
      </div>

      {/* Input */}
      <Card className="p-6 border border-border shadow-none space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="destination">Destination</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="destination" placeholder="Paris, France" value={destination}
                onChange={(e) => setDestination(e.target.value)} className="h-10 pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start">From</Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">To</Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
          </div>
        </div>

        {days > 0 && (
          <p className="text-sm text-muted-foreground">
            {days} day{days !== 1 ? "s" : ""} in {destination || "your destination"}
          </p>
        )}

        <div className="space-y-2">
          <Label>Activities</Label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <button key={a} onClick={() => toggleActivity(a)}
                className={cn("px-3 py-1.5 rounded-full border text-sm transition-all",
                  activities.includes(a)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}>{a}</button>
            ))}
          </div>
        </div>

        <Button onClick={generatePlan} disabled={generating || !destination} className="gap-2 shadow-rose">
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Planning your trip...</>
            : <><Sparkles className="w-4 h-4" /> Generate packing plan</>}
        </Button>
      </Card>

      {/* Plan result */}
      {plan && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Days planned", value: plan.packingList?.length ?? 0, icon: Calendar },
              { label: "Total items", value: plan.totalItemCount ?? 0, icon: Luggage },
              { label: "Must-pack items", value: plan.mustPackItems?.length ?? 0, icon: CheckCircle2 },
            ].map((s) => (
              <Card key={s.label} className="p-4 border border-border text-center shadow-none">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-heading font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Must pack */}
          {plan.mustPackItems?.length > 0 && (
            <Card className="p-5 border border-primary/20 bg-secondary/20 shadow-none">
              <p className="font-heading text-lg font-semibold mb-3">Must-pack items ✨</p>
              <div className="flex flex-wrap gap-2">
                {plan.mustPackItems.map((item: string) => (
                  <Badge key={item} variant="secondary" className="text-sm py-1 px-3">{item}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Day by day */}
          {plan.packingList?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading text-xl font-semibold">Day by day</h3>
              {plan.packingList.map((day: PackingDay) => (
                <Card key={day.day} className="p-4 border border-border hover:shadow-soft transition-all">
                  <p className="font-medium text-sm mb-3">
                    Day {day.day}
                    {day.date && <span className="text-muted-foreground font-normal ml-2">
                      {format(new Date(day.date), "EEE, MMM d")}
                    </span>}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {day.dayOutfit && (
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Day</p>
                        <p className="text-sm font-medium">{day.dayOutfit.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{day.dayOutfit.occasion}</p>
                      </div>
                    )}
                    {day.eveningOutfit && (
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Evening</p>
                        <p className="text-sm font-medium">{day.eveningOutfit.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{day.eveningOutfit.occasion}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <Card className="p-5 border border-border shadow-none">
              <p className="font-heading text-lg font-semibold mb-3">Packing tips</p>
              <ul className="space-y-2">
                {plan.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✦</span> {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Past lists */}
      {lists.length > 0 && !plan && (
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Past trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <Card key={list.id} className="p-4 border border-border hover:shadow-soft transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{list.destination}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(list.startDate), "MMM d")} — {format(new Date(list.endDate), "MMM d, yyyy")}
                </p>
                {list.activities?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {list.activities.slice(0, 3).map((a: string) => (
                      <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {lists.length === 0 && !plan && (
        <Card className="py-16 border-dashed border-2 border-primary/15 text-center">
          <Luggage className="w-10 h-10 text-primary/25 mx-auto mb-3" />
          <p className="font-heading text-xl font-semibold mb-2">No trips planned yet</p>
          <p className="text-sm text-muted-foreground">Enter a destination above to start packing.</p>
        </Card>
      )}
    </div>
  );
}
