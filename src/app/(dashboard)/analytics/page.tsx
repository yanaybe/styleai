import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";

export const metadata = { title: "Wardrobe Analytics" };

export default async function Analytics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [items, recommendations] = await Promise.all([
    prisma.wardrobeItem.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { timesWorn: "desc" },
    }).catch(() => []),
    prisma.outfitRecommendation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }).catch(() => []),
  ]);

  return <AnalyticsPage items={items} recommendations={recommendations} />;
}
