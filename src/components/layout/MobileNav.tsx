"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Calendar, Camera, ShoppingBag, Settings, BarChart2, Heart, Luggage } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",  icon: Home,        label: "Today" },
  { href: "/wardrobe",   icon: Shirt,        label: "Closet" },
  { href: "/outfits",    icon: Calendar,     label: "Outfits" },
  { href: "/inspiration",icon: Camera,       label: "Inspo" },
  { href: "/shopping",   icon: ShoppingBag,  label: "Shop" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-14 px-1">
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
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px]",
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
      </div>
    </nav>
  );
}
