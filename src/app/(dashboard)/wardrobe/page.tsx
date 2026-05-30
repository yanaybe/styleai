import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WardrobePage } from "@/components/wardrobe/WardrobePage";

export const metadata = { title: "My Closet" };

export default async function Wardrobe() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return <WardrobePage items={items} userId={user.id} />;
}
