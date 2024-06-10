import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "supabase/functions/database.types";
import type { Errorable } from "~/utils/errorable";
import type { Thread } from "./model";

export interface ThreadRepository {
  create(toolID: number): Promise<Errorable<Thread>>;
  get(threadID: number): Promise<Errorable<Thread | null>>;
}

export function newSupabaseThreadRepository(
  client: SupabaseClient<Database>,
): ThreadRepository {
  return {
    get: async (threadID: number) => {
      const { data: thread, error } = await client
        .from("threads")
        .select()
        .eq("id", threadID)
        .single();
      if (error) return { data: null, error: new Error(error.message) };
      if (!thread) return { data: null, error: new Error("Thread not found") };
      const newThread: Thread = {
        id: thread.id,
        toolID: thread.tool_id,
        createdAt: new Date(thread.created_at),
        createdBy: thread.created_by,
      };
      return { data: newThread, error: null };
    },
    create: async (toolID: number) => {
      const { data: thread, error } = await client
        .from("threads")
        .insert({ tool_id: toolID })
        .select()
        .single();
      if (error) return { data: null, error: new Error(error.message) };
      const newThread: Thread = {
        id: thread.id,
        toolID: thread.tool_id,
        createdAt: new Date(thread.created_at),
        createdBy: thread.created_by,
      };
      return { data: newThread, error: null };
    },
  };
}
