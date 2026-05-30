import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await request.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  try {
    const saved = await Promise.all(
      items.map((item) =>
        prisma.wardrobeItem.create({
          data: {
            userId: user.id,
            name: item.name,
            category: item.category,
            colorPrimary: item.color,
            styleTags: item.styleTags || [],
            imageUrl: item.imageUrl,
            isActive: true,
          },
        })
      )
    );

    return NextResponse.json({ saved: saved.length }, { status: 201 });
  } catch (err) {
    console.error("Bulk add error:", err);
    return NextResponse.json({ error: "Failed to add items" }, { status: 500 });
  }
}
