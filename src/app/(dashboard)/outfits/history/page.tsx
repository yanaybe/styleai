import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OutfitHistoryPage } from "@/components/outfits/OutfitHistoryPage";

export const metadata = { title: "Outfit History" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const recommendations = await prisma.outfitRecommendation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      outfit: {
        include: { items: { include: { item: true }, take: 6 } },
      },
    },
  }).catch(() => []);

  return <OutfitHistoryPage recommendations={recommendations} />;
}
