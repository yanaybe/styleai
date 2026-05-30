import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["TOPS","PANTS","SHORTS","SKIRTS","DRESSES","JACKETS","SHOES","BAGS","JEWELRY","ACCESSORIES"]),
  colorPrimary: z.string().optional(),
  colorSecondary: z.string().optional(),
  pattern: z.string().optional(),
  material: z.string().optional(),
  brand: z.string().optional(),
  formalityLevel: z.string().optional(),
  season: z.array(z.string()).default(["all"]),
  styleTags: z.array(z.string()).default([]),
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  notes: z.string().optional(),
  aiAnalysis: z.unknown().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const item = await prisma.wardrobeItem.create({
      data: {
        ...parsed.data,
        aiAnalysis: parsed.data.aiAnalysis ? parsed.data.aiAnalysis as object : undefined,
        userId: user.id,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
