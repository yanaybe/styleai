import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StyleProfilePage } from "@/components/style-profile/StyleProfilePage";

export const metadata = { title: "Style Profile" };

export default async function StyleProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const styleProfile = await prisma.styleProfile.findUnique({
    where: { userId: user.id },
  }).catch(() => null);

  return <StyleProfilePage initialProfile={styleProfile} />;
}
