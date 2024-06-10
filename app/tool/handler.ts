import type { Params } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "ai";
import type { Database } from "supabase/functions/database.types";
import { z } from "zod";
import { newSupabaseMessageRepository } from "~/message/repository";
import { newMessageService } from "~/message/service";
import type { Thread } from "~/thread/model";
import { newSupabaseThreadRepository } from "~/thread/repository";
import { newThreadService } from "~/thread/service";
import { newSupabaseToolRepository } from "./repository";
import { newToolService } from "./service";

const paramsSchema = z.object({
  toolID: z.coerce.number().describe("the id of the active tool"),
  threadID: z.coerce
    .number()
    .optional()
    .describe("the id of the active thread"),
});

const NotFoundResponse = new Response(null, {
  status: 404,
  statusText: "Not Found",
});

type ToolPageData = {
  messages: Message[];
  tool: {
    id: number;
  };
  thread: Thread | null;
};

export function newToolHandler(client: SupabaseClient<Database>) {
  return async function handler(params: Params<string>): Promise<ToolPageData> {
    const result = paramsSchema.safeParse(params);
    if (!result.success) throw NotFoundResponse;
    const { threadID } = result.data;
    const threadService = newThreadService(newSupabaseThreadRepository(client));
    const thread = threadID ? await threadService.get(threadID) : null;
    if (thread && !thread.data) throw NotFoundResponse;
    const toolService = newToolService(newSupabaseToolRepository(client));
    const msg = newMessageService(newSupabaseMessageRepository(client));
    const tool = await toolService.get(result.data.toolID);
    if (!tool.data) throw NotFoundResponse;
    const messages = threadID ? await msg.getAll(threadID) : undefined;
    return {
      messages:
        messages?.data?.reverse().map((m) => {
          return {
            id: m.id.toString(),
            role: m.role,
            createdAt: m.createdAt,
            requestID: m.heliconeRequestID,
            attachedFilePath: m.attachedFilePath,
            content: m.content,
            isInternal: m.metadata?.isInternal ?? false,
          };
        }) ?? [],
      tool: tool.data,
      thread: thread?.data ?? null,
    };
  };
}
