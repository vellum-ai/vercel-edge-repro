import { z } from "zod";

const environmentSchema = z.object({
  TARGET: z
    .enum(["web", "extension"])
    .describe("The target environment for the build")
    .default("web"),
  SITE_URL: z
    .string()
    .describe("The URL of the site, used for generating absolute URLs")
    .default(""),
  SUPABASE_URL: z.string().describe("The URL of the Supabase instance"),
  SUPABASE_ANON_KEY: z
    .string()
    .describe(
      "The public JWT of the Supabase instance used for anonymous access",
    ),
});

/**
 * A type-safe wrapper around environment variables access.
 * The values includes in the object are included in the client bundle.
 *
 * @example
 * const env = clientEnvironment
 * console.log(env.SUPABASE_ANON_KEY)
 */
export const clientEnvironment = environmentSchema.parse({
  TARGET: import.meta.env.VITE_TARGET,
  SITE_URL: import.meta.env.VITE_SITE_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
