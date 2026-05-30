import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { openai as getOpenAI } from "@/lib/openai-instance";

function getCurrentSeason(): { current: string; next: string; month: number } {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return { current: "spring", next: "summer", month };
  if (month >= 6 && month <= 8) return { current: "summer", next: "fall", month };
  if (month >= 9 && month <= 11) return { current: "fall", next: "winter", month };
  return { current: "winter", next: "spring", month };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wardrobe = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, name: true, category: true, colorPrimary: true,
      formalityLevel: true, season: true, styleTags: true, brand: true,
    },
  });

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { styleProfile: true },
  }).catch(() => null);

  const { current, next, month } = getCurrentSeason();
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a personal stylist analyzing wardrobe gaps for Talia.
Return only valid JSON — no markdown, no explanation outside the JSON.`,
      },
      {
        role: "user",
        content: `Analyze Talia's wardrobe and identify what she's missing for the current and upcoming seasons.

Current month: ${month} (${current} season, ${next} is coming soon)
Style profile: ${JSON.stringify(profile?.styleProfile ?? {})}
Current wardrobe: ${JSON.stringify(wardrobe)}

Return JSON:
{
  "gaps": [
    {
      "category": "item category",
      "reason": "why she needs this right now (1 sentence, mention the season)",
      "urgency": "high" | "medium" | "low",
      "suggestions": [
        {
          "name": "specific product name",
          "description": "brief description (color, style)",
          "priceRange": "e.g. $30-60",
          "stores": [
            { "name": "Zara", "url": "https://www.zara.com/il/en/woman-shoes-l1251.html", "why": "great selection" },
            { "name": "ASOS", "url": "https://www.asos.com/women/shoes/cat/?cid=4172", "why": "affordable options" }
          ]
        }
      ]
    }
  ],
  "summary": "One encouraging sentence about her wardrobe overall",
  "season": "${current}",
  "nextSeason": "${next}"
}

Rules:
- Identify 3-5 genuine gaps, not everything. Be realistic.
- Prioritize items she needs NOW for ${current}, and 1-2 for upcoming ${next}
- Suggestions must be specific and actionable
- Store URLs must be real working URLs for Israeli/international shoppers
- Use stores she can actually access: Zara, H&M, ASOS, Shein, Mango, Pull&Bear, Nike, Adidas, New Balance, Aldo, Steve Madden
- For Israeli shoppers, prefer stores with Israeli sites when available`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.4,
  });

  let result: Record<string, unknown> = {};
  try {
    const text = response.choices[0]?.message?.content ?? "{}";
    result = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
