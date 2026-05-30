import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { openai as getOpenAI } from "@/lib/openai-instance";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lists = await prisma.packingList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { outfits: true },
  });

  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { destination, startDate, endDate, activities } = await request.json();
  if (!destination || !startDate || !endDate) {
    return NextResponse.json({ error: "destination, startDate, endDate required" }, { status: 400 });
  }

  const wardrobe = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, name: true, category: true, colorPrimary: true,
      formalityLevel: true, season: true, styleTags: true,
    },
  });

  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a travel stylist creating packing lists from a user's wardrobe. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Create a ${days}-day packing plan for ${destination}.
Activities: ${activities?.join(", ") || "general travel"}
Wardrobe: ${JSON.stringify(wardrobe)}

Return JSON:
{
  "packingList": [
    {
      "day": 1,
      "date": "ISO date",
      "dayOutfit": { "name": "outfit name", "itemIds": ["id1","id2"], "occasion": "description" },
      "eveningOutfit": { "name": "outfit name", "itemIds": ["id1","id2"], "occasion": "description" }
    }
  ],
  "mustPackItems": ["essential item names from wardrobe"],
  "tips": ["packing tip 1", "packing tip 2"],
  "totalItemCount": number
}`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.5,
  });

  let plan: Record<string, unknown> = {};
  try { plan = JSON.parse(response.choices[0]?.message?.content ?? "{}"); } catch {}

  const list = await prisma.packingList.create({
    data: {
      userId: user.id,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      activities: activities ?? [],
    },
  });

  return NextResponse.json({ list, plan });
}
