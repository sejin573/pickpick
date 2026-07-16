import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_SERVER_FETCH_TIMEOUT_MS = 5000;

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. Middleware refreshes them.
        }
      },
    },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          SUPABASE_SERVER_FETCH_TIMEOUT_MS,
        );

        try {
          return await fetch(input, {
            ...init,
            signal: init?.signal ?? controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  });
}
