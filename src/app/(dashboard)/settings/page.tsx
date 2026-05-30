import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  }).catch(() => null);

  return <SettingsPage user={{ email: user.email ?? "", id: user.id }} profile={profile} />;
}
