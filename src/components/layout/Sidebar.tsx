"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, Home, Shirt, Calendar, History, Palette,
  Camera, BarChart2, Settings, LogOut, Heart,
  ShoppingBag, Luggage,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Today",
    description: "Daily outfit hub & overview",
  },
  {
    href: "/wardrobe",
    icon: Shirt,
    label: "My Closet",
    description: "Upload & manage your wardrobe",
  },
  {
    href: "/outfits",
    icon: Calendar,
    label: "Outfit Calendar",
    description: "Plan 14 days of outfits with AI",
  },
  {
    href: "/outfits/history",
    icon: History,
    label: "History",
    description: "Past outfits & your ratings",
  },
  {
    href: "/style-profile",
    icon: Palette,
    label: "Style Profile",
    description: "Colors, style & fit preferences",
  },
  {
    href: "/inspiration",
    icon: Camera,
    label: "Inspiration",
    description: "Recreate any look from your closet",
  },
  {
    href: "/shopping",
    icon: ShoppingBag,
    label: "Shopping",
    description: "What's missing this season",
  },
  {
    href: "/packing",
    icon: Luggage,
    label: "Packing",
    description: "Trip wardrobe planner",
  },
  {
    href: "/couples",
    icon: Heart,
    label: "Couples",
    description: "Coordinate looks with your partner",
  },
  {
    href: "/analytics",
    icon: BarChart2,
    label: "Analytics",
    description: "Wardrobe stats & insights",
  },
];

const bottomItems = [
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    description: "Profile, WhatsApp & preferences",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="font-heading text-lg font-semibold tracking-tight leading-none block">StyleAI</span>
          <span className="text-[10px] text-muted-foreground">Talia&apos;s stylist ✨</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/outfits" && pathname.startsWith(item.href)) ||
            (item.href === "/outfits" && pathname === "/outfits");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground shadow-rose"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className={cn(
                  "text-[10px] mt-0.5 leading-snug truncate transition-colors",
                  active ? "text-primary-foreground/70" : "text-muted-foreground/70"
                )}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-0.5 shrink-0">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className={cn("text-[10px] mt-0.5", active ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
