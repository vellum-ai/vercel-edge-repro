import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { multiParser } from "multiparser";
import { corsHeaders } from "../_shared/cors.ts";
import { DbResult } from "../database-helper.types.ts";

const updateContentTool = async (request: Request) => {
	switch (request.method) {
		case "OPTIONS": {
			return new Response(null, {
				headers: corsHeaders,
				status: 200,
			});
		}
		case "POST": {
			const authHeader = request.headers.get("Authorization")!;
			const supabaseClient = createClient(
				Deno.env.get("SUPABASE_URL") ?? "",
				Deno.env.get("SUPABASE_ANON_KEY") ?? "",
				{ global: { headers: { Authorization: authHeader } } },
			);

			try {
				const formData = await multiParser(request);
				if (!formData) {
					throw new Error("No form data");
				}
				const { uploadedFilePath, ...tool } = formData.fields;
				// const { uploadedFile } = formData.files;
				// get the document based off of uploadedFilePath:
				const { data: documentData } = await supabaseClient
					.from("documents_with_storage_path")
					.select("*")
					.eq("storage_object_path", uploadedFilePath)
					.single();
				const updateQuery = supabaseClient
					.from("tools")
					.update({
						title: tool.name,
						tool_type: tool.tool_type,
						system_prompt: tool.system_prompt,
						description: tool.description,
						allow_files: tool.allow_files,
						conversation_starter: tool.conversation_starter,
						integration_id: tool.integration_id || undefined,
					})
					.eq("id", tool.id)
					.select()
					.single();

				const res: DbResult<typeof updateQuery> = await updateQuery;
				if (res.error) throw new Error(res.error.message);

				// create the documents_tools join here:
				if (documentData) {
					await supabaseClient.from("documents_tools").insert({
						document_id: documentData.id,
						tool_id: res.data.id,
					});
				}
				console.log("here");
				return new Response(JSON.stringify(res.data), {
					headers: corsHeaders,
					status: 200,
				});
			} catch (err) {
				console.error(err);
				return new Response("Internal Server Error", {
					headers: corsHeaders,
					status: 500,
				});
			}
		}
		default:
			return new Response("Method Not Allowed", {
				headers: corsHeaders,
				status: 405,
			});
	}
};

Deno.serve(updateContentTool);
