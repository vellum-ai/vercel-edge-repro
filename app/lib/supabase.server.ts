import { createServerClient, parse, serialize } from "@supabase/ssr";
import { createClient as createAPIClient } from "@supabase/supabase-js";
import { environment } from "~/env/server.ts";
import type { Database } from "../../supabase/functions/database.types.ts";

const SUPABASE_URL = environment().SUPABASE_URL;
const SUPABASE_ANON_KEY = environment().SUPABASE_ANON_KEY;

/*
 * createClient creates a Supabase client from a request object.
 * If the request object contains an Authorization header, it will be used
 * to authenticate the client. Otherwise, the client will be authenticated
 * through cookies.
 */
export const createClient = (req: Request) => {
  const cookies = parse(req.headers.get("Cookie") ?? "");
  const headers = new Headers();
  const authorization = req.headers.get("Authorization");
  const jwt = authorization?.replace("Bearer ", "");
  if (jwt) {
    return createImpersonatedClient(jwt, SUPABASE_ANON_KEY);
  }
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
};

function createImpersonatedClient(jwt: string, key: string) {
  return createAPIClient<Database>(SUPABASE_URL, key, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}
