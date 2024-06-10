import { createBrowserClient } from "@supabase/ssr";
import { clientEnvironment } from "~/env/client.ts";
import type { Database } from "../../supabase/functions/database.types.ts";

export const supabase = createBrowserClient<Database>(
  clientEnvironment.SUPABASE_URL,
  clientEnvironment.SUPABASE_ANON_KEY,
);
