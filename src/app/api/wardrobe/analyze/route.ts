import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeClothingItem } from "@/lib/openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl } = await request.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  const analysis = await analyzeClothingItem(imageUrl);
  if (!analysis) return NextResponse.json({ error: "Analysis failed" }, { status: 500 });

  return NextResponse.json(analysis);
}
