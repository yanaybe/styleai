import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { openai as getOpenAI } from "@/lib/openai-instance";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.shoppingItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productImageUrl, productUrl, productName } = await request.json();
  if (!productImageUrl && !productName) {
    return NextResponse.json({ error: "productImageUrl or productName required" }, { status: 400 });
  }

  const wardrobe = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, name: true, category: true, colorPrimary: true,
      pattern: true, formalityLevel: true, styleTags: true,
    },
  });

  const openai = getOpenAI();

  const messages: Parameters<typeof openai.chat.completions.create>[0]["messages"] = [
    {
      role: "system",
      content: `You are a fashion AI expert analyzing whether a new item is worth buying based on a user's wardrobe.
Return only valid JSON.`,
    },
    {
      role: "user",
      content: productImageUrl
        ? [
            { type: "image_url" as const, image_url: { url: productImageUrl, detail: "high" as const } },
            {
              type: "text" as const,
              text: `Analyze this product for someone with this wardrobe: ${JSON.stringify(wardrobe)}

Return JSON:
{
  "productName": "name of the item",
  "category": "clothing category",
  "color": "main color",
  "style": "style description",
  "outfitOpportunities": number of new outfit combinations this unlocks,
  "styleMatchScore": 0.0-1.0 how well it matches existing wardrobe,
  "valueScore": 0.0-1.0 overall value score,
  "matchingItems": ["item names from wardrobe it goes with"],
  "outfitIdeas": ["3 specific outfit ideas using this piece"],
  "recommendation": "Buy it / Skip it / Maybe",
  "reasoning": "1-2 sentence explanation"
}`,
            },
          ]
        : `Analyze "${productName}" for someone with this wardrobe: ${JSON.stringify(wardrobe)}

Return JSON:
{
  "productName": "${productName}",
  "outfitOpportunities": number,
  "styleMatchScore": 0.0-1.0,
  "valueScore": 0.0-1.0,
  "matchingItems": [],
  "outfitIdeas": [],
  "recommendation": "Buy it / Skip it / Maybe",
  "reasoning": "explanation"
}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 600,
    temperature: 0.3,
  });

  let analysis: Record<string, unknown> = {};
  try {
    analysis = JSON.parse(response.choices[0]?.message?.content ?? "{}");
  } catch {}

  const item = await prisma.shoppingItem.create({
    data: {
      userId: user.id,
      productUrl: productUrl ?? null,
      productImageUrl: productImageUrl ?? null,
      productName: (analysis.productName as string) ?? productName ?? null,
      analysis: analysis as object,
      outfitOpportunities: (analysis.outfitOpportunities as number) ?? null,
      styleMatchScore: (analysis.styleMatchScore as number) ?? null,
      valueScore: (analysis.valueScore as number) ?? null,
    },
  });

  return NextResponse.json({ item, analysis });
}
