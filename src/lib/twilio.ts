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
  weather: string,
  temp: string
): Promise<string> {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const body = `${greeting}, Talia! ✨

Today: ${weather}, ${temp}°C

What are your plans today?

Reply with:
1️⃣ Work / Office
2️⃣ University / School
3️⃣ Gym / Workout
4️⃣ Date night 💕
5️⃣ Casual day
6️⃣ Tell me more ↓`;

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
  const digits = phone.replace(/\D/g, "");
  return `+${digits}`;
}
