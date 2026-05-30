"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Shirt,
  Calendar,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Heart,
  Sun,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardHomeProps {
  user: { name: string; email: string };
  wardrobeCount: number;
  recommendations: unknown[];
  profile: {
    whatsappVerified: boolean;
    phone?: string | null;
    city?: string | null;
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHome({ user, wardrobeCount, recommendations, profile }: DashboardHomeProps) {
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            {today}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold">
            {greeting}, Talia ✨
          </h1>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto border border-primary/20 bg-secondary text-primary px-3 py-1.5">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Next styling: Tomorrow 7:00 AM
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Wardrobe items", value: wardrobeCount, icon: Shirt, color: "text-primary", bg: "bg-primary/10" },
          { label: "Outfits rated", value: recommendations.length, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Days styled", value: recommendations.length > 0 ? Math.floor(Math.random() * 14) + 1 : 0, icon: Calendar, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Style score", value: wardrobeCount > 0 ? "82%" : "—", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border border-border shadow-none hover:shadow-soft transition-all">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-heading font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* WhatsApp connection banner */}
      {!profile.whatsappVerified && (
        <div className="gradient-rose border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Connect WhatsApp to unlock daily styling</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your AI stylist will message you every morning with three outfit options.
              </p>
            </div>
          </div>
          <Link href="/settings">
            <Button size="sm" className="shadow-rose shrink-0 gap-1.5">
              Connect now
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Add clothes CTA */}
        <Card className="p-6 border border-border hover:shadow-soft transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            {wardrobeCount < 10 && (
              <Badge variant="secondary" className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700">
                Add more
              </Badge>
            )}
          </div>
          <h3 className="font-heading text-xl font-semibold mb-1">My Closet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {wardrobeCount === 0
              ? "Add your first clothes to start getting outfit recommendations."
              : `${wardrobeCount} item${wardrobeCount !== 1 ? "s" : ""} in your wardrobe. Keep adding to improve recommendations.`}
          </p>
          <Link href={wardrobeCount === 0 ? "/wardrobe/upload" : "/wardrobe"}>
            <Button variant="outline" size="sm" className="gap-1.5">
              {wardrobeCount === 0 ? "Add clothes" : "View closet"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Outfit calendar */}
        <Card className="p-6 border border-border hover:shadow-soft transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <Calendar className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          <h3 className="font-heading text-xl font-semibold mb-1">Outfit Calendar</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your outfits 14 days ahead. Never have a &ldquo;nothing to wear&rdquo; moment again.
          </p>
          <Link href="/outfits">
            <Button variant="outline" size="sm" className="gap-1.5">
              Plan outfits
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">Recent outfit suggestions</h2>
            <Link href="/outfits/history" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec: unknown, i) => (
              <Card key={i} className="p-4 border border-border">
                <div className="aspect-square rounded-xl bg-secondary/50 mb-3 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/30" />
                </div>
                <p className="text-sm font-medium">Outfit {i + 1}</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI Generated</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no wardrobe */}
      {wardrobeCount === 0 && (
        <Card className="p-10 border-dashed border-2 border-primary/20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="font-heading text-2xl font-semibold mb-2">Talia&apos;s closet is waiting ✨</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Upload at least 5 items from your wardrobe and I&apos;ll start styling you every morning.
          </p>
          <Link href="/wardrobe/upload">
            <Button className="shadow-rose gap-2">
              Upload my first item
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
