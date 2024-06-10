import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionFunction } from "@vercel/remix";
import type { Database } from "supabase/functions/database.types";
import { z } from "zod";
import { createClient } from "~/lib/supabase.server";
import type { NewMessage } from "~/message/model";
import { newSupabaseMessageRepository } from "~/message/repository";
import { newMessageService } from "~/message/service";
import { MessageSchema } from "./api.generate";

const paramsSchema = z.object({
  toolID: z.coerce.number(),
  threadID: z.coerce.number(),
});

const requestBodySchema = MessageSchema;

export const action: ActionFunction = async ({ request, params }) => {
  const result = paramsSchema.safeParse(params);
  if (!result.success) {
    return new Response(null, { status: 400 });
  }
  switch (request.method) {
    case "POST": {
      const { threadID } = result.data;
      const body = await request.json();
      const { userMessage, attachedFilePath } = body;
      const supabase: SupabaseClient<Database> = createClient(request);
      const messageRepository = newSupabaseMessageRepository(supabase);
      const messageService = newMessageService(messageRepository);

      const newUserMessage: NewMessage = {
        role: "user",
        content: userMessage,
        attachedFilePath: attachedFilePath,
        heliconeRequestID: null,
      };
      const { error: insertUserMessageError } = await messageService.create(
        threadID,
        newUserMessage,
      );
      if (insertUserMessageError) {
        console.error("failed to insert user message", insertUserMessageError);
        return new Response(null, {
          status: 500,
          statusText: insertUserMessageError.message,
        });
      }

      const request_id = String(crypto.randomUUID());
      const newMessage: NewMessage = {
        role: "assistant",
        content: userMessage,
        attachedFilePath: attachedFilePath,
        heliconeRequestID: request_id,
      };
      const { data, error: messageError } = await messageService.create(
        threadID,
        newMessage,
      );
      if (messageError) {
        return new Response(null, {
          status: 500,
          statusText: messageError.message,
        });
      }
      const messageID = data.id;
      return new Response(JSON.stringify(messageID), { status: 201 });
    }
    default:
      return new Response(null, { status: 405 });
  }
};
