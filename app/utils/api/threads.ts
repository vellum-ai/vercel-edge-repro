import type { Message } from "ai";
import { supabase } from "~/lib/supabase.client";

export async function deleteThreadByID(id: number) {
  return supabase.from("threads").delete().eq("id", id).throwOnError();
}

/**
 * Fetch a list of threads matching the given `threadListInput`. If no input is
 * provided, all defaults will be used. See {@link ThreadListInput}.
 *
 * @param threadListInput
 * @returns
 */
export async function listThreadsForHistory(userID: string) {
  const threadListResult = await supabase
    .from("threads")
    .select("created_at,id,tool:tools(title,tool_type,id)")
    .eq("created_by", userID);
  if (threadListResult.error) throw threadListResult.error;
  if (!Array.isArray(threadListResult.data)) {
    throw new Error("No data returned from thread list query");
  }

  const threadIds = new Set<number>();
  for (const thread of threadListResult.data) {
    threadIds.add(thread.id);
  }

  const lastOutputResult = await supabase
    .from("messages")
    .select("content,created_at,thread_id")
    .filter("thread_id", "in", `(${Array.from(threadIds).join(",")})`)
    .order("created_at", { ascending: false });
  if (lastOutputResult.error) throw lastOutputResult.error;
  if (!Array.isArray(lastOutputResult.data)) {
    throw new Error("No data returned from thread message query");
  }

  // Group messages by thread ID into an object with thread ID as key
  const messagesByThreadId = lastOutputResult.data.reduce<
    Record<number, string[]>
  >((acc, message) => {
    const messagesForThread = acc[message.thread_id];
    if (messagesForThread) {
      messagesForThread.push(message.content);
    } else {
      acc[message.thread_id] = [message.content];
    }
    return acc;
  }, {});

  return threadListResult.data.map((threadHistory) => ({
    ...threadHistory,
    lastMessage: messagesByThreadId[threadHistory.id]?.[0] ?? "",
  }));
}
