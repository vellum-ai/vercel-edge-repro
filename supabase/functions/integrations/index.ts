import { Hono } from "https://deno.land/x/hono@v4.0.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { cors } from "../_shared/middleware.ts";
import { Database } from "../database.types.ts";
import { getFields, getIntegration, getTargetRoute } from "./util.ts";

const supabaseURL = Deno.env.get("SUPABASE_URL");
if (!supabaseURL) {
	throw new Error("SUPABASE_URL is not defined");
}
const supabasePrivateKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabasePrivateKey) {
	throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
}

const app = new Hono()
	.basePath("/integrations")
	.use(cors({ methods: ["GET"] }))
	.get("/:integrationID/parameters", async (c) => {
		const integrationID = c.req.param("integrationID");
		const client = createClient<Database>(supabaseURL, supabasePrivateKey);
		const { schema } = await getIntegration(integrationID, client);
		const { details } = getTargetRoute(schema);
		return c.json({ parameters: details.get.parameters });
	})
	.get("/:integrationID/values", async (c) => {
		const integrationID = c.req.param("integrationID");
		const client = createClient<Database>(supabaseURL, supabasePrivateKey);
		const { url, schema } = await getIntegration(integrationID, client);
		const { endpoint } = getTargetRoute(schema);
		const fieldsData = await getFields(url, endpoint, c.req.queries());
		return c.json({ values: fieldsData });
	})
	.get("/:integrationID/schema", async (c) => {
		const integrationID = c.req.param("integrationID");
		const client = createClient<Database>(supabaseURL, supabasePrivateKey);
		const { schema } = await getIntegration(integrationID, client);
		const { details } = getTargetRoute(schema);
		return c.json({
			fields: details.get.responses["200"].content["application/json"].schema,
		});
	});

Deno.serve(app.fetch);
