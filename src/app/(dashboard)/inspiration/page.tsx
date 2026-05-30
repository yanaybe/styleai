import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InspirationPage } from "@/components/inspiration/InspirationPage";

export const metadata = { title: "Style Inspiration" };

export default async function Inspiration() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const inspirations = await prisma.inspirationImage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { recreations: true },
  }).catch(() => []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <InspirationPage initialInspirations={inspirations as any} />;
}
