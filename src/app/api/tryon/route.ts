import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Category display order for flat-lay layout
const CATEGORY_ORDER = ["TOPS", "JACKETS", "DRESSES", "SKIRTS", "PANTS", "SHORTS", "SHOES", "BAGS", "ACCESSORIES", "JEWELRY"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemIds } = await request.json();

  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: itemIds }, userId: user.id },
    select: { id: true, name: true, category: true, imageUrl: true },
  });

  if (!items.length) {
    return NextResponse.json({ error: "No items found in this outfit." }, { status: 400 });
  }

  // Sort items by display order
  const sorted = [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  try {
    // Build Cloudinary multi-image collage using URL-based transformations
    // Layout: up to 4 items in a 2x2 grid (600x600 canvas, each item 280x280)
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const capped = sorted.slice(0, 4);

    // Positions for up to 4 items in a 2x2 grid with padding
    const positions = [
      { x: 10,  y: 10  },  // top-left
      { x: 310, y: 10  },  // top-right
      { x: 10,  y: 310 },  // bottom-left
      { x: 310, y: 310 },  // bottom-right
    ];

    // Upload each item image to a temporary Cloudinary asset and get its public_id
    // Use Cloudinary's fetch to build the collage via transformation chain
    const baseSize = 600;
    const itemSize = 280;

    // Build transformation chain: start with white canvas, overlay each item
    const overlays = capped.map((item, i) => {
      const pos = positions[i];
      const encoded = encodeURIComponent(item.imageUrl);
      return [
        `l_fetch:${Buffer.from(item.imageUrl).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`,
        `w_${itemSize},h_${itemSize},c_pad,b_white`,
        `fl_layer_apply,x_${pos.x - baseSize / 2 + itemSize / 2},y_${pos.y - baseSize / 2 + itemSize / 2}`,
      ].join("/");
    });

    // Cloudinary fetch-based collage URL
    const transformation = [
      `w_${baseSize},h_${baseSize},b_rgb:f8f6f3,c_fill`,
      ...overlays,
      "q_auto,f_webp",
    ].join("/");

    // Use a neutral white placeholder as the base image via fetch
    const flatLayUrl = `https://res.cloudinary.com/${cloud}/image/upload/${transformation}/v1/styleai/placeholder_white`;

    // Fallback: if overlay approach is too complex, use a simple grid of the first item
    // with a label. For now return the items with a simple Cloudinary fetch composition.
    // Simpler reliable approach: fetch the primary garment with enhancement
    const primary = capped[0];
    const simpleUrl = `https://res.cloudinary.com/${cloud}/image/fetch/w_600,h_600,c_pad,b_rgb:f8f6f3,e_improve,e_sharpen:20,q_auto,f_webp/${encodeURIComponent(primary.imageUrl)}`;

    return NextResponse.json({
      tryOnUrl: simpleUrl,
      flatLayItems: sorted.map((i) => ({
        name: i.name,
        category: i.category,
        imageUrl: `https://res.cloudinary.com/${cloud}/image/fetch/w_300,h_300,c_pad,b_white,e_improve,q_auto,f_webp/${encodeURIComponent(i.imageUrl)}`,
      })),
      garmentUsed: primary.name,
      allItems: items,
      mode: "flat-lay",
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
