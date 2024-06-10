import { OpenAI } from "https://deno.land/x/openai@v4.20.0/mod.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");
const HELICONE_API_KEY = Deno.env.get("HELICONE_API_KEY");

// work with 16k token max in gpt-3.5 during local development for now
const model: OpenAI.ChatCompletionCreateParams["model"] = "gpt-4o";

const openAI = new OpenAI({
	apiKey: apiKey || "",
	baseURL: "https://oai.hconeai.com/v1",
	defaultHeaders: {
		"Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
	},
});

type MessageType = {
	role: "user" | "assistant";
	content: string;
};

export type ReqJSON = {
	systemPrompt: string;
	threadId?: number;
	userMessage: MessageType;
	attachedFilePath?: string;
};

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		const responseHeaders = new Headers(corsHeaders);
		responseHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
		responseHeaders.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);
		return new Response(null, {
			headers: responseHeaders,
			status: 200,
		});
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
	const body = (await req.json()) as ReqJSON;
	const {
		// threadId,
		systemPrompt,
		userMessage,
		attachedFilePath,
	} = body;
	const supabasePublicURL = Deno.env.get("SUPABASE_URL") || "";
	const supabasePrivateKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
	const supabase = createClient(supabasePublicURL, supabasePrivateKey, {
		global: {
			headers: {
				authorization,
			},
		},
	});
	try {
		let attachedFileContext = "";
		if (attachedFilePath) {
			let { data: documentData } = await supabase
				.from("documents_with_storage_path")
				.select("*")
				.eq("storage_object_path", attachedFilePath)
				.single();

			// check to ensure that document has been "processed", ie all document sections
			// have been created:
			if (!documentData?.processed) {
				// wait a few seconds, and then try again:
				await new Promise((resolve) => setTimeout(resolve, 3000));
				({ data: documentData } = await supabase
					.from("documents_with_storage_path")
					.select("*")
					.eq("storage_object_path", attachedFilePath)
					.single());
				// LATER on if we decide to use an embeddings retrieval strategy,
				// we'll also want to check all the embeddings columns of the document
				// section to ensure that none are empty before we proceed with the retrieval.
			}

			// TODO: here we can figure out various strategies for using the attached
			// file, such as using an embedding query.
			// For now, we're going to go with "context" stuffing, where we just
			// ask gpt-3.5 for a summary and stuff the entire summary into context.

			// retrieve all sections from the document:
			const { data: documentSections } = await supabase
				.from("document_sections")
				.select("*")
				.eq("document_id", documentData?.id)
				.order("position", { ascending: true });

			// join all the text together from the sections:
			if (documentSections) {
				const documentText = documentSections
					.map(({ content }) => content)
					.join("\n");

				const outlinedSummary = await openAI.chat.completions.create({
					stream: false,
					model: model,
					messages: [
						{
							role: "system",
							content: `
              You are a document summarizer that's part of a larger chatbot system.

              Here are the instructions for the larger chatbot system:
              ---
              ${systemPrompt}
              ---

              Your role in this larger chatbot system is to summarize documents.
              First, provide concise outlined summary that captures the
              crucial points of each section.
              At the end, be sure to highlight the most important points of the
              document that relate to the instructions for the larger chatbot system,
              or anything that may be relevant to this additional context from the user:

              ---
              ${userMessage.content}
              ---

              If the instructions for the larger chatbot system actually
              ask you instead to highlight specific points from the document,
              then do that instead of providing an outlined summary.
              `,
						},
						{
							role: "user",
							content: `
               ${documentText}
              ---
              Provide an outlined summary of the text above.
              `,
						},
					],
				});
				// IMPORTANT TODO:
				// catch errors where the document has too many tokens and switch
				// to using gpt-4-turbo as a fallback for now.

				const assistantSummary =
					outlinedSummary.choices[0].message.content || "";
				attachedFileContext = `
          // The user attached the following file:
          ${documentData.name}
          Key points from the file:
          ${assistantSummary}

        `;
			}
		}
		// save context to thread here eventually:
		return new Response(JSON.stringify(attachedFileContext), {
			status: 200,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
