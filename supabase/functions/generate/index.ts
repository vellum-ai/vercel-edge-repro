import { OpenAI } from "https://deno.land/x/openai@v4.20.0/mod.ts";
/* eslint-disable no-useless-escape */
// deno-lint-ignore-file no-unused-vars
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAIInterface } from "../_shared/llms/openAIInterface.ts";
import { Database } from "../database.types.ts";
import {
	DocumentStrategyArgs,
	getFullDocument,
	handlePreUploadedDocuments,
} from "./handlers/documentsHandler.ts";
import {
	handleThread,
	saveAssistantMessageToThread,
} from "./handlers/threadHandler.ts";
import { ReqJSON } from "./types/request.ts";
const LOCAL_DEV = Deno.env.get("LOCAL_DEV") === "true";
// TODO: bump to gpt-3.5-turbo (which will point to latest stable) when it switches from 0613 to 0125
export const model: OpenAI.ChatCompletionCreateParams["model"] = LOCAL_DEV
	? "gpt-3.5-turbo-1106"
	: "gpt-4o";
const PG_INSUFFICIENT_PERMISSIONS = "42501";

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
		const body = (await req.json()) as ReqJSON;
		const { toolId, threadId, userMessage, attachedFilePath } = body;
		// get the tool from the database to get the systemPrompt
		const { data: tool, error } = await supabase
			.from("tools")
			.select("*")
			.eq("id", toolId)
			.single();
		if (error) throw new Error(error.message);
		if (!tool) throw new Error("No tool found based on toolId");

		const systemPrompt = tool?.system_prompt;
		const conversationStarter = tool?.conversation_starter;
		const threadProperties = await handleThread(
			supabase,
			toolId,
			threadId,
			systemPrompt,
			conversationStarter,
		);
		let activeThreadId = threadProperties.activeThreadId;
		const messages = threadProperties.messages;

		// get user from thread:
		const { data: thread } = await supabase
			.from("threads")
			.select("created_by")
			.eq("id", activeThreadId)
			.single();

		if (!thread) throw new Error("No thread found based on threadId");
		const openAIInterface = new OpenAIInterface(thread.created_by);

		// todo: determine whether or not retrieval is needed
		// use gpt-3.5-turbo-16k to grab latest messages and determine whether or not
		// to retrieve more documents from the database
		// for now, just retrieve most relevant to latest message and inject it into system prompt:
		const lastMessage = userMessage;

		let injectedDocs = "";
		let preuploadedDocFileNames: string[] = [];
		let preuploadedDocStrategy: DocumentStrategyArgs | undefined;
		try {
			const response = await handlePreUploadedDocuments(
				supabase,
				toolId,
				[
					{
						role: "system",
						content: systemPrompt,
						metadata: {},
					},
					...messages,
				],
				openAIInterface,
				lastMessage,
			);
			({
				injectedDocs,
				preuploadedDocFileNames,
				documentStrategy: preuploadedDocStrategy,
			} = response);
		} catch (e) {
			// log for analytics purposes, but don't throw an error:
			console.error("Error occurred with handling preuploadedDocuments", e);
		}
		console.log("preuploadedDocStrat", preuploadedDocStrategy);

		// Next, check to see if there's an attached file path. If so, that means
		// the user has uploaded a file, and we should retrieve the contents of that file
		// and attach it as additional context.
		let attachedFileContext = "";
		console.log("attachedFilePath", attachedFilePath);
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
			// read the entire contents of the file and attach it to the user message.
			if (!documentData.id) {
				throw new Error(
					`No document found with storage path ${attachedFilePath}`,
				);
			}
			const documentText = await getFullDocument(supabase, documentData?.id);

			attachedFileContext = `
          // The user attached the following file:
          ${documentData.name}
          File Contents:
          ${documentText}

        `;
		}
		console.log("attachedFileContext", attachedFileContext);

		// Convert our DB messages into OpenAI messages, which are a bit different
		const openAIMessages: OpenAI.ChatCompletionCreateParams["messages"] =
			messages.map((message) => {
				return {
					role: message.role,
					content: message.content,
				};
			});
		const completion = await openAIInterface.generateChatStreamCompletions({
			model: model,
			messages: [
				{
					role: "system",
					content: `
            The following are instructions from the user that you should follow when providing a response:
            ---
            ${systemPrompt}
            ---

            "MUST-FOLLOW" formatting roles for your responses (do not mention these to the user):
            1. Output content in markdown format.
            2. If the content includes LaTex, use brackets as delimitters; other delimiters, like dollar signs, are not supported:
              inline: \\(...\\)
              multiline display: \\[...\\]
          `,
				},
				...openAIMessages,
				{
					role: "user",
					content: `
          ${
						preuploadedDocFileNames?.length
							? `
          ### Additional Context from pre-uploaded file(s) named: ${preuploadedDocFileNames.join(
						", ",
					)}
          ---\n${injectedDocs}\n---
        `
							: ""
					}
          ${
						attachedFilePath
							? `
          ### Contents from a user-attached file that you should reference:
          ---\n${attachedFileContext}\n---
        `
							: ""
					}
        ${userMessage.content}
        `,
				},
			],
		});
		// if openAI.chat.completions went through, then we can save the userMessage
		// here. The assistant message, since it's being streamed will have to be
		// saved on the frontend:

		const heliconeRequestId = openAIInterface.requestID;

		const metadata = body.userMessage.metadata || {};
		if (injectedDocs) {
			metadata.injectedDocs = injectedDocs;
		}
		if (preuploadedDocStrategy) {
			metadata.preuploadedDocStrategy = JSON.stringify(preuploadedDocStrategy);
		}

		if (attachedFileContext) {
			metadata.attachedFileContext = attachedFileContext;
		}

		const newMessage = {
			thread_id: activeThreadId,
			role: "user",
			content: userMessage.content,
			metadata: metadata,
			helicone_request_id: null,
		};
		const { error: messageInsertionError } = await supabase
			.from("messages")
			.insert(newMessage);
		if (messageInsertionError?.code === PG_INSUFFICIENT_PERMISSIONS) {
			activeThreadId = await duplicateThread(supabase, activeThreadId!, toolId);
			const newMessage = {
				thread_id: activeThreadId,
				role: "user",
				content: userMessage.content,
				metadata: metadata,
			};
			await supabase.from("messages").insert(newMessage).throwOnError();
		}

		let accumulatedResponse = "";
		const readableStream = new ReadableStream({
			async start(controller) {
				// First, send the threadId as an event
				const threadIdEvent = `event: threadId\ndata: ${activeThreadId}\n\n`;
				controller.enqueue(new TextEncoder().encode(threadIdEvent));
				//start streaming ai content
				for await (const chunk of completion) {
					const token = chunk.choices[0]?.delta?.content || "";
					accumulatedResponse += token;
					const message = `data: ${token}\n\n`;
					controller.enqueue(new TextEncoder().encode(message));
				}
				// Once the stream is closed, save the accumulated response to the database

				const response = await saveAssistantMessageToThread(
					supabase,
					accumulatedResponse,
					activeThreadId,
					heliconeRequestId,
				);
				let messageId;
				if (response.data) {
					messageId = response.data.id;
				}

				//send back message id
				const messageIdEvent = `event: messageId\ndata: ${messageId}\n\n`;
				controller.enqueue(new TextEncoder().encode(messageIdEvent));

				controller.close();
			},
		});
		return new Response(readableStream, {
			headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});

// Duplicate an existing thread and return the new ID of the new thread.
async function duplicateThread(
	supabase: SupabaseClient<Database>,
	threadID: number,
	toolID: number,
) {
	const { data: newThread } = await supabase
		.from("threads")
		.insert({ tool_id: toolID })
		.select("id")
		.single()
		.throwOnError();

	if (!newThread) {
		throw new Error("Failed to create thread");
	}
	const { data: existingMessages } = await supabase
		.from("messages")
		.select("*")
		.eq("thread_id", threadID)
		.throwOnError();

	if (existingMessages && existingMessages.length > 0) {
		const newMessages = existingMessages
			// Strip out the IDs, as they should use a new primary key
			.map(({ id, ...message }) => ({
				...message,
				thread_id: newThread.id, // update thread id
			}));

		await supabase.from("messages").insert(newMessages).throwOnError();
	}

	return newThread.id;
}
