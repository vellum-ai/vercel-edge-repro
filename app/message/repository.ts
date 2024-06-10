import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "supabase/functions/database.types";
import type { Errorable } from "~/utils/errorable";
import type { Message, NewMessage } from "./model";

export interface MessageRepository {
  create(threadID: number, message: NewMessage): Promise<Errorable<Message>>;
  insertMany(
    threadID: number,
    messages: NewMessage[],
  ): Promise<Errorable<Message[]>>;
  update(messageID: number, content: string): Promise<Errorable<Message>>;
  getAll(threadID: number): Promise<Errorable<Message[]>>;
}

export function newSupabaseMessageRepository(
  client: SupabaseClient<Database>,
): MessageRepository {
  return {
    update: async (messageID, content) => {
      const { data, error } = await client
        .from("messages")
        .update({ content })
        .eq("id", messageID)
        .select()
        .single();
      if (error) return { data: null, error: new Error(error.message) };
      if (!data) return { data: null, error: new Error("message not found") };
      return {
        data: {
          id: data.id,
          content: data.content,
          role: data.role as "user" | "assistant" | "system",
          createdAt: new Date(data.created_at),
          attachedFilePath: data.attached_file_path,
          heliconeRequestID: data.helicone_request_id,
        },
        error: null,
      };
    },
    insertMany: async (threadID: number, messages: Message[]) => {
      const { data, error } = await client
        .from("messages")
        .insert(
          messages.map((m) => {
            return {
              role: m.role,
              content: m.content,
              attached_file_path: m.attachedFilePath,
              helicone_request_id: m.heliconeRequestID,
              created_at: m.createdAt.toISOString(),
              metadata: { ...m.metadata },
              thread_id: threadID,
            };
          }),
        )
        .select();
      if (error) return { data: null, error: new Error(error.message) };
      const insertedMessages: Message[] = [];
      for (const message of data) {
        insertedMessages.push({
          id: message.id,
          content: message.content,
          role: message.role as "user" | "assistant" | "system",
          createdAt: new Date(message.created_at),
          attachedFilePath: message.attached_file_path,
          heliconeRequestID: message.helicone_request_id,
          metadata: message.metadata as Message["metadata"],
        });
      }
      return { data: insertedMessages, error: null };
    },
    create: async (threadID: number, newMessage: NewMessage) => {
      const { data: message, error } = await client
        .from("messages")
        .insert({
          role: newMessage.role,
          content: newMessage.content,
          attached_file_path: newMessage.attachedFilePath,
          helicone_request_id: newMessage.heliconeRequestID,
          thread_id: threadID,
          metadata: { ...newMessage.metadata },
        })
        .select()
        .single();
      if (error) return { data: null, error: new Error(error.message) };
      const insertedMessage: Message = {
        id: message.id,
        content: message.content,
        role: message.role as "user" | "assistant" | "system",
        createdAt: new Date(message.created_at),
        attachedFilePath: message.attached_file_path,
        heliconeRequestID: message.helicone_request_id,
        metadata: message.metadata as object,
      };
      return { data: insertedMessage, error: null };
    },
    getAll: async (threadID: number) => {
      const { data, error } = await client
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("thread_id", threadID);
      if (error) return { data: null, error: new Error(error.message) };
      const messages: Message[] = [];
      for (const message of data) {
        messages.push({
          id: message.id,
          content: message.content,
          role: message.role as "user" | "assistant" | "system",
          createdAt: new Date(message.created_at),
          attachedFilePath: null,
          heliconeRequestID: message.helicone_request_id,
          metadata: message.metadata as Message["metadata"],
        });
      }
      return { data: messages, error: null };
    },
  };
}
