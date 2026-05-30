"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Shirt, Calendar, ShoppingBag, MoreHorizontal,
  Camera, History, Palette, BarChart2, Settings,
  Luggage, Heart, X, LogOut, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const mainNav = [
  { href: "/dashboard", icon: Home,        label: "Today" },
  { href: "/wardrobe",  icon: Shirt,        label: "Closet" },
  { href: "/outfits",   icon: Calendar,     label: "Outfits" },
  { href: "/shopping",  icon: ShoppingBag,  label: "Shop" },
];

const moreFeatures = [
  {
    href: "/inspiration",
    icon: Camera,
    label: "Inspiration",
    description: "Upload any look — I'll recreate it from your wardrobe",
    color: "bg-rose-50 text-rose-500",
  },
  {
    href: "/style-profile",
    icon: Palette,
    label: "Style Profile",
    description: "Your colors, style, and fit preferences",
    color: "bg-violet-50 text-violet-500",
  },
  {
    href: "/outfits/history",
    icon: History,
    label: "Outfit History",
    description: "Every outfit generated + your ratings",
    color: "bg-amber-50 text-amber-500",
  },
  {
    href: "/packing",
    icon: Luggage,
    label: "Packing",
    description: "Trip wardrobe planner — tell me where you're going",
    color: "bg-sky-50 text-sky-500",
  },
  {
    href: "/couples",
    icon: Heart,
    label: "Couples",
    description: "Coordinate outfits with your partner",
    color: "bg-pink-50 text-pink-500",
  },
  {
    href: "/analytics",
    icon: BarChart2,
    label: "Analytics",
    description: "Most worn, forgotten gems, wardrobe stats",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    description: "Profile, WhatsApp, and preferences",
    color: "bg-gray-50 text-gray-500",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showMore, setShowMore] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    setShowMore(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/98 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-14 px-1">
          {mainNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[52px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-all", active && "scale-110")} />
                <span className={cn("text-[9px] font-medium", active ? "text-primary" : "text-muted-foreground/70")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[52px]",
              showMore ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-medium text-muted-foreground/70">More</span>
          </button>
        </div>
      </nav>

      {/* More bottom sheet */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card rounded-t-3xl border-t border-border shadow-xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-heading font-semibold">All Features</span>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Feature list */}
            <div className="px-4 py-3 space-y-1 max-h-[65vh] overflow-y-auto">
              {moreFeatures.map((feature) => {
                const active = pathname === feature.href || pathname.startsWith(feature.href);
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-3.5 p-3 rounded-2xl transition-all",
                      active ? "bg-primary/8 border border-primary/20" : "hover:bg-secondary/60"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", feature.color)}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm", active && "text-primary")}>{feature.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{feature.description}</p>
                    </div>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </Link>
                );
              })}

              {/* Sign out */}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-secondary/60 transition-all mt-2"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm text-muted-foreground">Sign out</p>
                </div>
              </button>
            </div>

            <div className="h-2" />
          </div>
        </>
      )}
    </>
  );
}
