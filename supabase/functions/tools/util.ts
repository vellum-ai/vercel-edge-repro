import { HTTPException } from "https://deno.land/x/hono@v4.0.2/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Database } from "../database.types.ts";

/**
 * Fetches the tools data from Supabase by integration ID and returns the schema URL.
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 * @param {string} toolID - The ID of the tool to fetch.
 * @returns {Promise<{schema_url: string}>} The fetched integration data containing the schema URL.
 * @throws {HTTPException} Throws an HTTPException if the request fails or the integration is not found.
 */
export async function fetchTool(
	toolID: string,
	client: SupabaseClient<Database>,
) {
	const { data, error } = await client
		.from("tools")
		.select("*, tool_fields (field_type, label, integration_key)")
		.eq("id", toolID)
		.single();
	if (error) throw new HTTPException(500, { message: error.message });
	if (!data) throw new HTTPException(404, { message: "Integration not found" });
	return data;
}
