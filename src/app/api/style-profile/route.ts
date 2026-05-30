import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.styleProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(profile ?? {});
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const profile = await prisma.styleProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...body },
    update: body,
  });

  return NextResponse.json(profile);
}
