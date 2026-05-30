import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CouplesPage } from "@/components/couples/CouplesPage";

export const metadata = { title: "Couples Mode" };

export default async function Couples() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const connection = await prisma.coupleConnection.findFirst({
    where: {
      OR: [{ userIdOne: user.id }, { userIdTwo: user.id }],
    },
    include: {
      userOne: { select: { name: true, avatarUrl: true, userId: true } },
      userTwo: { select: { name: true, avatarUrl: true, userId: true } },
    },
  }).catch(() => null);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { name: true },
  }).catch(() => null);

  return <CouplesPage connection={connection} currentUserId={user.id} currentUserName={profile?.name ?? ""} />;
}
