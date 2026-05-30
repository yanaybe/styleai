"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Shirt, Calendar, MessageCircle,
  ArrowRight, TrendingUp, Heart, Sun, Clock,
  Camera, ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface Rec {
  id: string;
  type: string;
  outfit?: {
    name?: string | null;
    items: Array<{ id: string; item: { name: string; thumbnailUrl?: string | null; imageUrl: string } }>;
  } | null;
}

interface DashboardHomeProps {
  user: { name: string; email: string };
  wardrobeCount: number;
  recommendations: Rec[];
  onboardingDone: boolean;
  profile: {
    whatsappVerified: boolean;
    phone?: string | null;
    city?: string | null;
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const TYPE_COLOR: Record<string, string> = {
  SAFE: "bg-emerald-400",
  STYLISH: "bg-primary",
  TRENDY: "bg-violet-400",
};

export function DashboardHome({ user, wardrobeCount, recommendations, onboardingDone, profile }: DashboardHomeProps) {
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            {today}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold leading-tight">
            {greeting}, Talia ✨
          </h1>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto border border-primary/20 bg-secondary text-primary px-3 py-1.5 text-xs whitespace-nowrap">
          <Clock className="w-3 h-3 mr-1.5" />
          Next styling: Tomorrow 7:00 AM
        </Badge>
      </div>

      {/* Onboarding banner */}
      {!onboardingDone && (
        <div className="gradient-rose border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Finish setting up your profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tell me your style so I can personalize everything for you.</p>
            </div>
          </div>
          <Link href="/onboarding">
            <Button size="sm" className="shadow-rose shrink-0 gap-1.5 w-full sm:w-auto">
              Complete setup <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* WhatsApp banner */}
      {!profile.whatsappVerified && onboardingDone && (
        <div className="gradient-rose border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Connect WhatsApp for daily styling</p>
              <p className="text-xs text-muted-foreground mt-0.5">I&apos;ll message you every morning with outfit options.</p>
            </div>
          </div>
          <Link href="/settings">
            <Button size="sm" className="shadow-rose shrink-0 gap-1.5 w-full sm:w-auto">
              Connect <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wardrobe items",  value: wardrobeCount,             icon: Shirt,      color: "text-primary",    bg: "bg-primary/10" },
          { label: "Outfits rated",   value: recommendations.length,    icon: Heart,      color: "text-rose-500",   bg: "bg-rose-50" },
          { label: "Days styled",     value: recommendations.length > 0 ? recommendations.length : 0, icon: Calendar, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Style score",     value: wardrobeCount > 4 ? "✨" : "—",             icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-3 sm:p-4 border border-border shadow-none">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl sm:text-2xl font-heading font-semibold">{stat.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add clothes */}
        <Card className="p-4 sm:p-5 border border-border hover:shadow-soft transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            {wardrobeCount < 5 && (
              <Badge variant="secondary" className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700">
                Add {Math.max(0, 5 - wardrobeCount)} more to unlock AI
              </Badge>
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold mb-1">My Closet</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {wardrobeCount === 0
              ? "Add your first clothes to start getting outfit recommendations."
              : `${wardrobeCount} item${wardrobeCount !== 1 ? "s" : ""} in your wardrobe.`}
          </p>
          <Link href={wardrobeCount === 0 ? "/wardrobe/upload" : "/wardrobe"}>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              {wardrobeCount === 0 ? "Add clothes" : "View closet"}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </Card>

        {/* Outfit calendar */}
        <Card className="p-4 sm:p-5 border border-border hover:shadow-soft transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <Calendar className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          <h3 className="font-heading text-lg font-semibold mb-1">Plan Outfits</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Get 3 outfit options for any day — AI picks from your wardrobe and the weather.
          </p>
          <Link href="/outfits">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              Open calendar
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Feature shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/inspiration">
          <Card className="p-4 border border-border hover:shadow-soft hover:border-primary/30 transition-all cursor-pointer">
            <Camera className="w-5 h-5 text-primary mb-2" />
            <p className="font-medium text-sm">Inspiration</p>
            <p className="text-xs text-muted-foreground mt-0.5">Recreate any look</p>
          </Card>
        </Link>
        <Link href="/shopping">
          <Card className="p-4 border border-border hover:shadow-soft hover:border-primary/30 transition-all cursor-pointer">
            <ShoppingBag className="w-5 h-5 text-primary mb-2" />
            <p className="font-medium text-sm">Shopping</p>
            <p className="text-xs text-muted-foreground mt-0.5">What to buy next</p>
          </Card>
        </Link>
      </div>

      {/* Recent recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-xl font-semibold">Recent outfits</h2>
            <Link href="/outfits/history" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec) => (
              <Card key={rec.id} className="overflow-hidden border border-border">
                <div className={`h-0.5 ${TYPE_COLOR[rec.type] ?? "bg-primary"}`} />
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {rec.outfit?.items?.slice(0, 4).map((oi) => (
                      <div key={oi.id} className="aspect-square rounded-lg overflow-hidden bg-secondary/50 relative">
                        {oi.item.thumbnailUrl ?? oi.item.imageUrl ? (
                          <Image src={oi.item.thumbnailUrl ?? oi.item.imageUrl} alt={oi.item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-primary/30" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium truncate">{rec.outfit?.name ?? "Outfit"}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{rec.type?.toLowerCase()}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {wardrobeCount === 0 && (
        <Card className="py-12 px-6 border-dashed border-2 border-primary/20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary/40" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">Talia&apos;s closet is waiting ✨</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Upload at least 5 items and I&apos;ll start styling you every morning.
          </p>
          <Link href="/wardrobe/upload">
            <Button className="shadow-rose gap-2">
              <Shirt className="w-4 h-4" /> Add my first item
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
