import { OpenAI } from "https://deno.land/x/openai@v4.16.1/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { multiParser } from "multiparser";
import { corsHeaders } from "../_shared/cors.ts";
import { handleFileUploads } from "../_shared/handleFileUploads.ts";
import { Database } from "../database.types.ts";

const contentGenerationInference = async (request: Request) => {
	switch (request.method) {
		case "OPTIONS": {
			return new Response(null, {
				headers: corsHeaders,
				status: 200,
			});
		}
		case "POST":
			try {
				const supabasePublicURL = Deno.env.get("SUPABASE_URL") || "";
				const supabasePrivateKey =
					Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
				const openaiPrivateKey = Deno.env.get("OPENAI_API_KEY");
				const openai = new OpenAI({ apiKey: openaiPrivateKey });
				const supabase = createClient<Database>(
					supabasePublicURL,
					supabasePrivateKey,
				);
				const formData = await multiParser(request);
				if (!formData) {
					throw new Error("No form data");
				}
				const { userPrompt, toolID } = formData.fields;
				const { userFile, uploadedFile } = formData.files;
				console.log("uploadedFile", uploadedFile);
				console.log("userFile", userFile);
				const openAIFile = await handleFileUploads(uploadedFile, openai);
				console.log("openAIFile", openAIFile);

				// Fetch Assistant using tool_id -> assistant_id
				const query = await supabase
					.from("tools")
					.select("*")
					.eq("id", toolID)
					.limit(1)
					.single();
				if (!query.data) {
					throw new Error("No tool found based on toolId");
				}
				const assistantsID = query.data.assistants_id;
				const fileIds = [];
				if (openAIFile) {
					fileIds.push(openAIFile.id);
				}

				// Create a Thread using assistant_id -> thread_id and pass in file id to the message list
				const thread = await openai.beta.threads.create({
					messages: [
						{
							role: "user",
							content:
								"Please execute what the instruction states with or without files, and take the following additional details into consideration: " +
								JSON.stringify(userPrompt),
							file_ids: fileIds,
						},
					],
				});
				if (!assistantsID) {
					throw new Error("Assistant Id is required in order to run thread");
				}
				const run = await openai.beta.threads.runs.create(thread.id, {
					assistant_id: assistantsID,
				});
				return new Response(
					JSON.stringify({
						runID: run.id,
						threadID: thread.id,
					}),
					{ headers: corsHeaders, status: 200 },
				);
			} catch (err) {
				console.error(err);
				return new Response("Internal Server Error", {
					headers: corsHeaders,
					status: 500,
				});
			}
		default:
			return new Response("Method Not Allowed", {
				headers: corsHeaders,
				status: 405,
			});
	}
};

Deno.serve(contentGenerationInference);
