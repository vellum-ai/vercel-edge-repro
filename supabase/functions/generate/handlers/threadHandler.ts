// threadHandler.ts

import { SupabaseClient } from "@supabase/supabase-js";
import { DbResult } from "../../database-helper.types.ts";
import { Database, Json } from "../../database.types.ts";
import { MessageType } from "../types/message.ts";

// Function to handle the initialization of a thread or retrieve its history.
export async function handleThread(
	supabase: SupabaseClient<Database>,
	toolId: number,
	threadId?: number,
	systemPrompt?: string,
	conversationStarter?: string | null,
): Promise<{ activeThreadId: number; messages: MessageType[] }> {
	let activeThreadId = threadId;
	let messages: MessageType[] = [];

	if (!activeThreadId) {
		// Instantiate a new thread if it's the start of a conversation
		const createThreadQuery = supabase
			.from("threads")
			.insert({ tool_id: toolId })
			.select()
			.single();
		const {
			data: thread,
			error: threadError,
		}: DbResult<typeof createThreadQuery> = await createThreadQuery;
		if (threadError) throw new Error(threadError.message);

		activeThreadId = thread?.id;
		if (!activeThreadId) throw new Error("Error creating thread");

		// Save the system prompt as the first message in the thread
		if (systemPrompt) {
			await supabase.from("messages").insert({
				thread_id: activeThreadId,
				role: "system",
				content: systemPrompt,
				helicone_request_id: null,
			});
		}

		//save welcome message
		if (conversationStarter) {
			await supabase.from("messages").insert({
				thread_id: activeThreadId,
				role: "assistant",
				content: conversationStarter,
			});
		}
	} else {
		// Build up the history of messages based on thread id
		const { data: threadMessages } = await supabase
			.from("messages")
			.select("*")
			.eq("thread_id", activeThreadId)
			.in("role", ["user", "assistant"])
			.order("created_at", { ascending: true })
			.throwOnError();

		// Convert thread messages into MessageType[]
		messages =
			threadMessages?.map((message) => ({
				role: message.role as "user" | "assistant" | "system",
				content: message.content,
				metadata: message.metadata as Record<string, Json>,
			})) || [];
	}

	return { activeThreadId, messages };
}

export async function saveAssistantMessageToThread(
	supabase: SupabaseClient<Database>,
	accumulatedResponse: string,
	threadId: number,
	heliconeRequestId: string,
) {
	const query = supabase
		.from("messages")
		.insert({
			thread_id: threadId,
			role: "assistant",
			content: accumulatedResponse,
			helicone_request_id: heliconeRequestId,
		})
		.select("id")
		.single()
		.throwOnError();
	const res: DbResult<typeof query> = await query;

	return res;
}
