import { createClient } from "@supabase/supabase-js";
import { env } from "@xenova/transformers";
import { generateEmbeddings } from "../_shared/generateEmbeddings.ts";

// Configuration for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
	if (!supabaseUrl || !supabaseAnonKey) {
		return new Response(
			JSON.stringify({
				error: "Missing environment variables.",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const authorization = req.headers.get("Authorization");

	if (!authorization) {
		return new Response(
			JSON.stringify({ error: `No authorization header passed` }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	try {
		const supabase = createClient(supabaseUrl, supabaseAnonKey, {
			global: {
				headers: {
					authorization,
				},
			},
			auth: {
				persistSession: false,
			},
		});

		const { ids, table, contentColumn, embeddingColumn } = await req.json();

		const { data: rows, error: selectError } = await supabase
			.from(table)
			.select(`id, ${contentColumn}` as "*")
			.in("id", ids)
			.is(embeddingColumn, null);

		if (selectError) {
			return new Response(JSON.stringify({ error: selectError }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
		const promises = rows.map(async (row) => {
			const { id, [contentColumn]: content } = row;

			if (!content) {
				console.error(`No content available in column '${contentColumn}'`);
				return;
			}

			const output = await generateEmbeddings(content);
			const embedding = JSON.stringify(output);

			const { error } = await supabase
				.from(table)
				.update({
					[embeddingColumn]: embedding,
				})
				.eq("id", id);

			if (error) {
				console.error(error);
				console.error(
					`Failed to save embedding on '${table}' table with id ${id}`,
				);
			} else {
				console.log(`Generated embedding on '${table}' for id ${id}`);
			}
		});

		await Promise.allSettled(promises);

		return new Response(null, {
			status: 204,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		console.error(e);
		return new Response(null, {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
});
