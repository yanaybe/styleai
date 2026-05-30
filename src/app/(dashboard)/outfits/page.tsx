import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OutfitCalendarPage } from "@/components/outfits/OutfitCalendarPage";

export const metadata = { title: "Outfit Calendar" };

export default async function OutfitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <OutfitCalendarPage userId={user.id} />;
}
