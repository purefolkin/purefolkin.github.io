import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=configuration");

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; app_metadata?: { role?: string } } | undefined;
  const allowedIds = (process.env.PUREFOLK_ADMIN_USER_IDS ?? "").split(",").map(x => x.trim()).filter(Boolean);
  const allowed = !!claims?.sub && (claims.app_metadata?.role === "admin" || allowedIds.includes(claims.sub));

  if (error || !allowed) redirect("/admin/login");
  return { supabase, userId: claims!.sub! };
}
