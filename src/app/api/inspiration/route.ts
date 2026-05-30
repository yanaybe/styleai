import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { analyzeInspirationImage } from "@/lib/openai";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inspirations = await prisma.inspirationImage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { recreations: true },
  });

  return NextResponse.json(inspirations);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, source } = await request.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  const wardrobeItems = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, name: true, category: true, colorPrimary: true,
      pattern: true, formalityLevel: true, styleTags: true, season: true,
    },
  });

  const analysis = await analyzeInspirationImage(imageUrl, wardrobeItems);

  const inspiration = await prisma.inspirationImage.create({
    data: {
      userId: user.id,
      imageUrl,
      source: source ?? "upload",
      analysis: analysis as object,
      itemsDetected: analysis?.matchedItemIds ?? [],
    },
  });

  if (analysis?.matchedItemIds?.length) {
    await prisma.pinterestRecreation.create({
      data: {
        userId: user.id,
        inspirationId: inspiration.id,
        matchScore: analysis.matchScore ?? 0,
        substitutions: analysis.substitutions as object,
      },
    });
  }

  return NextResponse.json({ inspiration, analysis });
}
