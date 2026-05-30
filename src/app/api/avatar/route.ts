import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { uploadAvatarImage } from "@/lib/cloudinary";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const avatars = await prisma.userAvatar.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(avatars);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const imageType = (formData.get("imageType") as string) ?? "full_body";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Max 20MB" }, { status: 413 });

  const bytes = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
  const { url } = await uploadAvatarImage(base64, user.id);

  // If setting as primary, unset others of same type
  if (imageType === "full_body") {
    await prisma.userAvatar.updateMany({
      where: { userId: user.id, imageType: "full_body", isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const avatar = await prisma.userAvatar.create({
    data: {
      userId: user.id,
      imageUrl: url,
      imageType,
      isPrimary: true,
    },
  });

  // Store primary avatar URL in profile
  await prisma.userProfile.update({
    where: { userId: user.id },
    data: { avatarUrl: url },
  });

  return NextResponse.json(avatar, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await prisma.userAvatar.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
