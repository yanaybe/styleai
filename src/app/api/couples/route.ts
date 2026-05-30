import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.coupleConnection.findFirst({
    where: {
      OR: [{ userIdOne: user.id }, { userIdTwo: user.id }],
      status: { in: ["active", "pending"] },
    },
    include: {
      userOne: { select: { name: true, avatarUrl: true, userId: true } },
      userTwo: { select: { name: true, avatarUrl: true, userId: true } },
    },
  });

  return NextResponse.json(connection ?? null);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerEmail, action, connectionId } = await request.json();

  if (action === "accept" && connectionId) {
    const updated = await prisma.coupleConnection.update({
      where: { id: connectionId },
      data: { status: "active", connectedAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  if (action === "disconnect" && connectionId) {
    await prisma.coupleConnection.delete({ where: { id: connectionId } });
    return NextResponse.json({ success: true });
  }

  if (!partnerEmail) return NextResponse.json({ error: "partnerEmail required" }, { status: 400 });

  const partnerProfile = await prisma.userProfile.findFirst({
    where: {},
  });

  if (!partnerProfile) {
    return NextResponse.json({ error: "Partner not found — they need to sign up first" }, { status: 404 });
  }

  const existing = await prisma.coupleConnection.findFirst({
    where: {
      OR: [
        { userIdOne: user.id, userIdTwo: partnerProfile.userId },
        { userIdOne: partnerProfile.userId, userIdTwo: user.id },
      ],
    },
  });

  if (existing) return NextResponse.json({ error: "Already connected or pending" }, { status: 409 });

  const connection = await prisma.coupleConnection.create({
    data: {
      userIdOne: user.id,
      userIdTwo: partnerProfile.userId,
      status: "pending",
    },
  });

  return NextResponse.json(connection, { status: 201 });
}
