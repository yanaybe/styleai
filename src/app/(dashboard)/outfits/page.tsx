import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OutfitCalendarPage } from "@/components/outfits/OutfitCalendarPage";

export const metadata = { title: "Outfit Calendar" };

export default async function OutfitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const primaryAvatar = await prisma.userAvatar.findFirst({
    where: { userId: user.id, imageType: "full_body", isPrimary: true },
    select: { imageUrl: true },
  }).catch(() => null);

  return <OutfitCalendarPage userId={user.id} avatarUrl={primaryAvatar?.imageUrl ?? null} />;
}
