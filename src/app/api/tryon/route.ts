import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function beautifyUrl(rawUrl: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return rawUrl;
  // Fetch the try-on image through Cloudinary with beauty enhancements:
  // e_improve: auto brightness/contrast/color
  // e_sharpen:40: crisp details
  // e_viesus_correct: professional photo correction
  // q_auto:best: maximum quality
  const encoded = encodeURIComponent(rawUrl);
  return `https://res.cloudinary.com/${cloud}/image/fetch/e_improve,e_viesus_correct,e_sharpen:40,q_auto:best/${encoded}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { outfitId, avatarUrl, itemIds } = await request.json();

  if (!avatarUrl) {
    return NextResponse.json({ error: "Upload a full-body photo in the 'Me' tab first." }, { status: 400 });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "Try-on service not configured." }, { status: 503 });
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: itemIds }, userId: user.id },
    select: { id: true, name: true, category: true, imageUrl: true },
  });

  // Prefer dress > top > jacket for the main garment
  const priority = ["DRESSES", "TOPS", "JACKETS", "SKIRTS", "PANTS", "SHORTS"];
  const garment = priority
    .map((cat) => items.find((i) => i.category === cat))
    .find(Boolean) ?? items[0];

  if (!garment) {
    return NextResponse.json({ error: "No wearable items found in this outfit." }, { status: 400 });
  }

  const category =
    ["DRESSES"].includes(garment.category) ? "dresses"
    : ["TOPS", "JACKETS"].includes(garment.category) ? "upper_body"
    : "lower_body";

  try {
    const replicateRes = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
          input: {
            human_img: avatarUrl,
            garm_img: garment.imageUrl,
            garment_des: `Beautiful ${garment.name}, styled elegantly`,
            is_checked: true,
            is_checked_crop: false,
            denoise_steps: 45,
            seed: 12345,
            category,
          },
        }),
      }
    );

    if (!replicateRes.ok) {
      const err = await replicateRes.json().catch(() => ({}));
      return NextResponse.json({ error: "Try-on generation failed", detail: err }, { status: 500 });
    }

    let prediction = await replicateRes.json();

    // Poll if still processing
    let attempts = 0;
    while (["processing", "starting"].includes(prediction.status) && attempts < 40) {
      await new Promise((r) => setTimeout(r, 2500));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await poll.json();
      attempts++;
    }

    if (prediction.error) {
      return NextResponse.json({ error: `Try-on failed: ${prediction.error}` }, { status: 500 });
    }

    if (!prediction.output) {
      return NextResponse.json({ error: "Try-on timed out. Try again." }, { status: 504 });
    }

    const rawUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

    // Apply Cloudinary beauty enhancement
    const tryOnUrl = beautifyUrl(rawUrl);

    return NextResponse.json({
      tryOnUrl,
      rawUrl,
      garmentUsed: garment.name,
      allItems: items,
    });

  } catch (err) {
    console.error("Try-on error:", err);
    return NextResponse.json({ error: "Try-on service unavailable." }, { status: 500 });
  }
}
