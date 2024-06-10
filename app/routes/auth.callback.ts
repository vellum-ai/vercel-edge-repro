import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { createServerClient, parse, serialize } from "@supabase/ssr";
import { environment } from "~/env/server";

const SUPABASE_URL = environment().SUPABASE_URL;
const SUPABASE_ANON_KEY = environment().SUPABASE_ANON_KEY;

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";
  const headers = new Headers();

  if (code) {
    const cookies = parse(request.headers.get("Cookie") ?? "");
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(decodeURIComponent(redirectTo), { headers });
    }
  }

  // return the user to an error page with instructions
  return redirect("/auth/auth-code-error", { headers });
}
