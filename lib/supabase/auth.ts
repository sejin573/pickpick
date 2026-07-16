import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (error || !userId) return { supabase, userId: null };
    return { supabase, userId };
  } catch (error) {
    console.warn("Supabase auth lookup skipped", error);
    return { supabase, userId: null };
  }
}
