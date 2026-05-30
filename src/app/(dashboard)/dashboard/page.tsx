import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Auto-create profile if first time (upsert)
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, name: "Talia", onboardingDone: false },
    update: {},
    include: { styleProfile: true },
  }).catch(() => null);

  const [wardrobeCount, recentRecommendations] = await Promise.all([
    prisma.wardrobeItem.count({
      where: { userId: user.id, isActive: true },
    }).catch(() => 0),
    prisma.outfitRecommendation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        outfit: { include: { items: { include: { item: true }, take: 4 } } },
      },
    }).catch(() => []),
  ]);

  return (
    <DashboardHome
      user={{ name: "Talia", email: user.email ?? "" }}
      wardrobeCount={wardrobeCount}
      recommendations={recentRecommendations}
      onboardingDone={profile?.onboardingDone ?? false}
      profile={{
        whatsappVerified: profile?.whatsappVerified ?? false,
        phone: profile?.phone ?? null,
        city: profile?.city ?? null,
      }}
    />
  );
}
