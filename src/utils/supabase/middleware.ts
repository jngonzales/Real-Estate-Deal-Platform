import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const responseCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const responseHeaders = new Headers();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers: Record<string, string> = {}) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          responseCookies.push(...cookiesToSet);
          Object.entries(headers).forEach(([name, value]) => responseHeaders.set(name, value));
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  await supabase.auth.getUser();

  const supabaseResponse = NextResponse.next({ request });
  responseCookies.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
  responseHeaders.forEach((value, name) => supabaseResponse.headers.set(name, value));
  return supabaseResponse;
}
