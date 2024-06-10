import { Hono } from "https://deno.land/x/hono@v4.0.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { cors } from "../_shared/middleware.ts";
import { Database } from "../database.types.ts";
import { fetchTool } from "./util.ts";

const supabaseURL = Deno.env.get("SUPABASE_URL");
if (!supabaseURL) {
	throw new Error("SUPABASE_URL is not defined");
}
const supabasePrivateKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabasePrivateKey) {
	throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
}
const app = new Hono()
	.basePath("/tools")
	.use(cors({ methods: ["GET"] }))
	.get("/:toolID", async (c) => {
		const toolID = c.req.param("toolID");
		const client = createClient<Database>(supabaseURL, supabasePrivateKey);
		const fullTools = await fetchTool(toolID, client);
		return c.json({ tool: fullTools });
	});

Deno.serve(app.fetch);
