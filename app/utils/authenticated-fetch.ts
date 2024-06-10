import { clientEnvironment } from "~/env/client";
import { supabase } from "~/lib/supabase.client";

export const authenticatedFetch = async (url: string, options: RequestInit) => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data || !data.session) {
    throw new Error("Failed to fetch: Not authenticated");
  }
  const response = await fetch(`${clientEnvironment.SITE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response;
};
