import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recommendationId, rating, wasWorn } = await request.json();
  if (!recommendationId || !rating) {
    return NextResponse.json({ error: "recommendationId and rating required" }, { status: 400 });
  }

  const rec = await prisma.outfitRecommendation.findFirst({
    where: { id: recommendationId, userId: user.id },
  });
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.outfitRecommendation.update({
    where: { id: recommendationId },
    data: {
      rating,
      wasWorn: wasWorn ?? undefined,
    },
  });

  if (wasWorn && rec.outfitId) {
    const outfit = await prisma.outfit.findUnique({
      where: { id: rec.outfitId },
      include: { items: true },
    });
    if (outfit) {
      await Promise.all(
        outfit.items.map((item) =>
          prisma.wardrobeItem.update({
            where: { id: item.itemId },
            data: {
              timesWorn: { increment: 1 },
              lastWornAt: new Date(),
            },
          })
        )
      );
    }
  }

  return NextResponse.json(updated);
}
