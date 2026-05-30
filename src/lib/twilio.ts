import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_FROM!;

export { client as twilioClient };

export async function sendWhatsAppMessage(to: string, body: string): Promise<string> {
  const message = await client.messages.create({
    from: FROM,
    to: `whatsapp:${to}`,
    body,
  });
  return message.sid;
}

export async function sendWhatsAppMedia(
  to: string,
  body: string,
  mediaUrl: string
): Promise<string> {
  const message = await client.messages.create({
    from: FROM,
    to: `whatsapp:${to}`,
    body,
    mediaUrl: [mediaUrl],
  });
  return message.sid;
}

export async function sendMorningMessage(
  to: string,
  userName: string,
  weather: string,
  temp: string
): Promise<string> {
  const body = `Good morning, ${userName}! ✨

Today is ${weather}, ${temp}°C

What's on your agenda today?

Reply with:
1️⃣ Work / Office
2️⃣ University / School
3️⃣ Gym / Workout
4️⃣ Date night
5️⃣ Casual day out
6️⃣ Tell me your plans ↓`;

  return sendWhatsAppMessage(to, body);
}

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
}

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "").startsWith("1")
    ? `+${phone.replace(/\D/g, "")}`
    : `+${phone.replace(/\D/g, "")}`;
}
