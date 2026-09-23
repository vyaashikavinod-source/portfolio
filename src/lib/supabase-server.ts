import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: () => {} } });
}

export async function getEditor() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("editor_roles").select("role").eq("user_id", user.id).maybeSingle();
  return data?.role === "admin" || data?.role === "editor" ? { email: user.email ?? "Editor", role: data.role } : null;
}
