import OpenAI from "openai";

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return globalForOpenAI.openai;
}

export async function analyzeClothingItem(imageUrl: string) {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a fashion AI expert. Analyze clothing items from photos and return structured JSON data.
Always return valid JSON with no markdown formatting.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "auto" },
          },
          {
            type: "text",
            text: `Analyze this clothing item and return JSON with these exact fields:
{
  "name": "descriptive item name",
  "category": one of ["TOPS","PANTS","SHORTS","SKIRTS","DRESSES","JACKETS","SHOES","BAGS","JEWELRY","ACCESSORIES"],
  "colorPrimary": "main color name",
  "colorSecondary": "secondary color if exists, else null",
  "pattern": one of ["solid","stripes","floral","plaid","geometric","animal_print","abstract","tie_dye","other"] or null,
  "material": "best guess at material (cotton/silk/denim/leather/etc)",
  "brand": "brand name if visible, else null",
  "formalityLevel": one of ["casual","smart_casual","business","formal"],
  "season": array of ["spring","summer","fall","winter","all"],
  "styleTags": array of 2-5 style descriptors like ["minimalist","feminine","edgy","classic"],
  "confidence": number 0-1 representing confidence in this analysis
}`,
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateOutfitRecommendations(context: {
  wardrobe: unknown[];
  weather: unknown;
  events: unknown[];
  styleProfile: unknown;
  recentOutfits: unknown[];
  userName: string;
}) {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are StyleAI, a warm and stylish personal stylist. Generate outfit recommendations from a user's wardrobe.
Always return valid JSON. Be specific about which exact items (by ID) to combine.
Consider weather, events, style preferences, and outfit variety.`,
      },
      {
        role: "user",
        content: `Generate 3 outfit recommendations for ${context.userName}.

WARDROBE: ${JSON.stringify(context.wardrobe)}
WEATHER: ${JSON.stringify(context.weather)}
EVENTS TODAY: ${JSON.stringify(context.events)}
STYLE PROFILE: ${JSON.stringify(context.styleProfile)}
RECENT OUTFITS (avoid repetition): ${JSON.stringify(context.recentOutfits)}

Return JSON array with 3 outfits:
[{
  "type": "SAFE" | "STYLISH" | "TRENDY",
  "name": "catchy outfit name",
  "itemIds": ["id1", "id2", ...],
  "reasoning": "why this outfit works",
  "weatherExplanation": "how it suits the weather",
  "styleExplanation": "style notes and tips",
  "confidenceScore": 0.0-1.0
}]`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content ?? "[]";
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function processConversationMessage(context: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  currentRecommendations: unknown;
  wardrobe: unknown[];
  styleProfile: unknown;
  weather: unknown;
}) {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are StyleAI, Talia's personal AI stylist on WhatsApp. Talia is your only user.
Be warm, friendly, and feel like a best friend who happens to know everything about fashion.
Address her as Talia. Be concise — this is WhatsApp, not an essay.
When suggesting outfit changes, reference specific items from her wardrobe.
If she asks to change something, update the outfit and explain why the new combo works.
Current outfit options: ${JSON.stringify(context.currentRecommendations)}
Available wardrobe: ${JSON.stringify(context.wardrobe)}
Weather: ${JSON.stringify(context.weather)}
Style profile: ${JSON.stringify(context.styleProfile)}`,
      },
      ...context.messages,
    ],
    max_tokens: 600,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function analyzeInspirationImage(imageUrl: string, wardrobeItems: unknown[]) {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a fashion AI expert. Analyze inspiration images and match them to available wardrobe items.
Return structured JSON only.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "auto" },
          },
          {
            type: "text",
            text: `Analyze this outfit inspiration and recreate it using items from this wardrobe: ${JSON.stringify(wardrobeItems)}

Return JSON:
{
  "analysis": {
    "style": "description of the overall look",
    "colors": ["color1", "color2"],
    "occasion": "when you'd wear this",
    "vibe": "aesthetic/vibe of the look"
  },
  "matchedItemIds": ["id1", "id2"],
  "substitutions": [{"original": "item from inspiration", "substitute": "item from wardrobe", "reason": "why it works"}],
  "missingItems": ["items they'd need to buy to fully recreate this"],
  "matchScore": 0.0-1.0,
  "stylingTips": "how to style the available pieces to get closest to this look"
}`,
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.4,
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
