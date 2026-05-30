import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { styleProfile: true },
  }).catch(() => null);

  if (!profile) redirect("/onboarding");
  if (!profile.onboardingDone) redirect("/onboarding");

  const [wardrobeCount, recentRecommendations] = await Promise.all([
    prisma.wardrobeItem.count({
      where: { userId: user.id, isActive: true },
    }).catch(() => 0),
    prisma.outfitRecommendation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        outfit: {
          include: { items: { include: { item: true } } },
        },
      },
    }).catch(() => []),
  ]);

  return (
    <DashboardHome
      user={{ name: profile.name ?? user.email ?? "there", email: user.email ?? "" }}
      wardrobeCount={wardrobeCount}
      recommendations={recentRecommendations}
      profile={profile}
    />
  );
}
