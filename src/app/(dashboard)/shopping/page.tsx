import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShoppingAssistantPage } from "@/components/shopping/ShoppingAssistantPage";

export const metadata = { title: "Shopping Assistant" };

export default async function Shopping() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await prisma.shoppingItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ShoppingAssistantPage initialItems={items as any} />;
}
