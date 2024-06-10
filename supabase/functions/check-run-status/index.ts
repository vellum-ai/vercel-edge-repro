// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.16.1/mod.ts";
import { ThreadMessage } from "https://deno.land/x/openai@v4.16.1/resources/beta/threads/messages/messages.ts";
import { corsHeaders } from "../_shared/cors.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");

const openAI = new OpenAI({ apiKey: apiKey || "" });

serve(async (req) => {
	switch (req.method) {
		case "OPTIONS": {
			return new Response(null, {
				headers: corsHeaders,
				status: 200,
			});
		}
		case "POST":
			try {
				const { runID, threadID } = await req.json();
				let message;
				const run = await openAI.beta.threads.runs.retrieve(threadID, runID);
				if (run.status == "completed") {
					const messages = await openAI.beta.threads.messages.list(threadID);
					// Find the last message for the current run
					const lastMessageForRun = messages.data
						.filter(
							(m: ThreadMessage) =>
								m.run_id === run.id && m.role === "assistant",
						)
						.pop();
					message = lastMessageForRun;
				}
				return new Response(
					JSON.stringify({
						runStatus: run.status,
						message: message,
					}),
					{ headers: corsHeaders, status: 200 },
				);
			} catch (error) {
				console.error("Error parsing JSON:", error);
				return new Response("Invalid JSON input", {
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "text/plain" },
				});
			}
	}

	return new Response(JSON.stringify({}), {
		headers: { "Content-Type": "application/json" },
	});
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
