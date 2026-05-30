import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateOutfitRecommendations } from "@/lib/openai";
import { getWeatherForecast } from "@/lib/weather";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, eventDescription } = await request.json().catch(() => ({}));
  const targetDate = date ? new Date(date) : new Date();

  await prisma.userProfile.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} }).catch(() => null);

  try {
  const [profile, wardrobeItems, styleProfile, recentRecs] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.wardrobeItem.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true, name: true, category: true, colorPrimary: true,
        colorSecondary: true, pattern: true, formalityLevel: true,
        season: true, styleTags: true, brand: true, timesWorn: true,
        lastWornAt: true, isFavorite: true,
      },
    }),
    prisma.styleProfile.findUnique({ where: { userId: user.id } }),
    prisma.outfitRecommendation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 14,
      include: { outfit: { include: { items: { select: { itemId: true } } } } },
    }),
  ]);

  if (!wardrobeItems.length) {
    return NextResponse.json({ error: "Add clothes to your wardrobe first" }, { status: 400 });
  }

  const weather = profile?.city
    ? await getWeatherForecast(profile.city, profile.country ?? "")
    : null;

  const recentItemIds = recentRecs
    .flatMap((r) => r.outfit?.items.map((i) => i.itemId) ?? []);

  const aiOutfits = await generateOutfitRecommendations({
    wardrobe: wardrobeItems,
    weather,
    events: eventDescription ? [{ description: eventDescription, date: targetDate }] : [],
    styleProfile,
    recentOutfits: recentItemIds,
    userName: profile?.name ?? "there",
  });

  if (!aiOutfits?.length) {
    return NextResponse.json({ error: "AI returned no outfits — try again" }, { status: 500 });
  }

  const created = await Promise.all(
    aiOutfits.map(async (ai: {
      type: string;
      name: string;
      itemIds: string[];
      reasoning: string;
      weatherExplanation: string;
      styleExplanation: string;
      confidenceScore: number;
    }) => {
      const validIds = ai.itemIds.filter((id: string) =>
        wardrobeItems.some((w) => w.id === id)
      );
      if (!validIds.length) return null;

      const outfit = await prisma.outfit.create({
        data: {
          userId: user.id,
          name: ai.name,
          source: "AI_GENERATED",
          items: {
            create: validIds.map((itemId: string, idx: number) => ({
              itemId,
              layerOrder: idx,
            })),
          },
        },
        include: { items: { include: { item: true } } },
      });

      const rec = await prisma.outfitRecommendation.create({
        data: {
          userId: user.id,
          outfitId: outfit.id,
          date: targetDate,
          weatherData: weather as object ?? undefined,
          reasoning: `${ai.reasoning} ${ai.weatherExplanation} ${ai.styleExplanation}`,
          confidenceScore: ai.confidenceScore,
          type: ai.type as "SAFE" | "STYLISH" | "TRENDY",
        },
      });

      return { ...rec, outfit, aiData: ai };
    })
  );

  const results = created.filter(Boolean);
  if (!results.length) {
    return NextResponse.json({ error: "AI suggested items not found in your wardrobe — try again" }, { status: 500 });
  }
  return NextResponse.json({ recommendations: results, weather });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
