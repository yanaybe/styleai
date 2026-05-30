import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PackingAssistantPage } from "@/components/packing/PackingAssistantPage";

export const metadata = { title: "Packing Assistant" };

export default async function Packing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lists = await prisma.packingList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  }).catch(() => []);

  return <PackingAssistantPage initialLists={lists} />;
}
