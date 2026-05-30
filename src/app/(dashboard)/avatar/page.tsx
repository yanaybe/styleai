import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AvatarPage } from "@/components/avatar/AvatarPage";

export const metadata = { title: "My Photos" };

export default async function Avatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avatars = await prisma.userAvatar.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
  }).catch(() => []);

  return <AvatarPage initialAvatars={avatars} />;
}
