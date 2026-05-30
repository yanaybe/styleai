import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadInspirationImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
  const result = await uploadInspirationImage(base64, user.id);

  return NextResponse.json(result);
}
