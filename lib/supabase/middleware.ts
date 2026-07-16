import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_CHECK_TIMEOUT_MS = 1500;

const hasSupabaseAuthCookie = (request: NextRequest) =>
  request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          AUTH_CHECK_TIMEOUT_MS,
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

  if (!hasSupabaseAuthCookie(request)) return response;

  try {
    await Promise.race([
      supabase.auth.getClaims(),
      new Promise((resolve) => setTimeout(resolve, AUTH_CHECK_TIMEOUT_MS)),
    ]);
  } catch (error) {
    console.warn("Supabase middleware auth refresh skipped", error);
  }

  return response;
}
