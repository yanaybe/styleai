import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { outfitId, avatarUrl, itemIds } = await request.json();

  if (!avatarUrl) {
    return NextResponse.json({ error: "Upload a full-body photo first in the Me tab" }, { status: 400 });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "Try-on service not configured yet" }, { status: 503 });
  }

  // Get wardrobe items to try on
  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: itemIds }, userId: user.id },
    select: { id: true, name: true, category: true, imageUrl: true },
  });

  // Filter to wearable categories for try-on (tops, bottoms, dresses, jackets)
  const tryOnItems = items.filter((i) =>
    ["TOPS", "PANTS", "SHORTS", "SKIRTS", "DRESSES", "JACKETS"].includes(i.category)
  );

  if (!tryOnItems.length) {
    return NextResponse.json({ error: "No wearable clothing items to try on" }, { status: 400 });
  }

  // Use first garment (top or dress) for try-on
  // Chain: top → then bottom on resulting image
  const garment = tryOnItems.find((i) => ["TOPS", "DRESSES", "JACKETS"].includes(i.category))
    ?? tryOnItems[0];

  const category = ["DRESSES", "TOPS"].includes(garment.category) ? "upper_body"
    : ["PANTS", "SHORTS", "SKIRTS"].includes(garment.category) ? "lower_body"
    : "upper_body";

  try {
    // Call Replicate IDM-VTON model
    const replicateRes = await fetch("https://api.replicate.com/v1/models/cuuupid/idm-vton/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          human_img: avatarUrl,
          garm_img: garment.imageUrl,
          garment_des: `${garment.name} - ${garment.category}`,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
          category,
        },
      }),
    });

    if (!replicateRes.ok) {
      const err = await replicateRes.json().catch(() => ({}));
      console.error("Replicate error:", err);
      return NextResponse.json({ error: "Try-on generation failed", detail: err }, { status: 500 });
    }

    const prediction = await replicateRes.json();

    // If still processing, poll
    if (prediction.status === "processing" || prediction.status === "starting") {
      let result = prediction;
      let attempts = 0;
      while (["processing", "starting"].includes(result.status) && attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
        });
        result = await pollRes.json();
        attempts++;
      }
      if (result.output) {
        const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        return NextResponse.json({ tryOnUrl: outputUrl, garmentUsed: garment.name, allItems: items });
      }
      return NextResponse.json({ error: "Try-on timed out. Try again." }, { status: 504 });
    }

    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    return NextResponse.json({ tryOnUrl: outputUrl, garmentUsed: garment.name, allItems: items });

  } catch (err) {
    console.error("Try-on error:", err);
    return NextResponse.json({ error: "Try-on service unavailable" }, { status: 500 });
  }
}
