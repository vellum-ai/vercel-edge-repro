import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  AZURE_API_KEY: z.string().min(1),
  AZURE_DOMAIN: z.string().min(1),
  HELICONE_API_KEY: z.string().min(1),
  GOOGLE_CLIENT_EMAIL: z
    .string()
    .min(1)
    .describe(
      "The email address of the Google service account used for Google Drive API",
    ),
  GOOGLE_PRIVATE_KEY: z
    .string()
    .min(1)
    .transform((key) => key.replace(/\\n/g, "\n"))
    .describe(
      "The private key of the Google service account used for Google Drive API",
    ),
  VELLUM_API_KEY: z.string().min(1),
});

/**
 * A type-safe wrapper around environment variables access.
 * This can only be used server-side, as process.env is undefined
 * on clients.
 *
 * @example
 * const env = environment()
 * console.log(env.NODE_ENV)
 */
export const environment = () =>
  environmentSchema.parse({
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    ...process.env,
  });
