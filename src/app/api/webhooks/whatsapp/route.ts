import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { processConversationMessage } from "@/lib/openai";
import { validateTwilioSignature } from "@/lib/twilio";
import { headers } from "next/headers";

const PLAN_INTENTS: Record<string, string> = {
  "1": "Work / Office",
  "2": "University / School",
  "3": "Gym / Workout",
  "4": "Date night",
  "5": "Casual day out",
  "work": "Work / Office",
  "university": "University / School",
  "gym": "Gym / Workout",
  "date": "Date night",
  "casual": "Casual day out",
};

export async function POST(request: Request) {
  const headersList = await headers();
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const twilioSignature = headersList.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`;

  if (process.env.NODE_ENV === "production" && !validateTwilioSignature(url, params, twilioSignature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From?.replace("whatsapp:", "");
  const messageBody = params.Body?.trim() ?? "";

  if (!from) return new Response("OK", { status: 200 });

  const userProfile = await prisma.userProfile.findFirst({
    where: { phone: from },
    include: { styleProfile: true },
  }).catch(() => null);

  if (!userProfile) {
    await sendWhatsAppMessage(from, "Hi! I don't have your account linked yet. Please visit styleai.app to connect your WhatsApp. ✨");
    return new Response("OK", { status: 200 });
  }

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: {
      userId: userProfile.userId,
      status: "active",
      startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    include: { messages: { orderBy: { sentAt: "asc" }, take: 20 } },
  }).catch(() => null);

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        userId: userProfile.userId,
        sessionId: `${userProfile.userId}_${Date.now()}`,
        status: "active",
      },
      include: { messages: true },
    });
  }

  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "inbound",
      content: messageBody,
      messageType: "text",
      twilioSid: params.MessageSid,
    },
  });

  const wardrobeItems = await prisma.wardrobeItem.findMany({
    where: { userId: userProfile.userId, isActive: true },
    take: 30,
    select: { id: true, name: true, category: true, colorPrimary: true, formalityLevel: true, season: true },
  }).catch(() => []);

  const planIntent = PLAN_INTENTS[messageBody.toLowerCase()];
  const conversationHistory = conversation.messages.map((m) => ({
    role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  conversationHistory.push({ role: "user", content: planIntent ? `My plans today: ${planIntent}` : messageBody });

  const reply = await processConversationMessage({
    messages: conversationHistory,
    currentRecommendations: [],
    wardrobe: wardrobeItems,
    styleProfile: userProfile.styleProfile,
    weather: null,
  });

  await sendWhatsAppMessage(from, reply);

  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "outbound",
      content: reply,
      messageType: "text",
    },
  });

  return new Response("OK", { status: 200 });
}
