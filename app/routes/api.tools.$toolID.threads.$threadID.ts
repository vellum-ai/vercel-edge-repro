import type { SupabaseClient } from "@supabase/supabase-js";
import { type ActionFunction, type LoaderFunction, json } from "@vercel/remix";
import type { Database } from "supabase/functions/database.types";
import { z } from "zod";
import { createClient } from "~/lib/supabase.server";
import { newSupabaseMessageRepository } from "~/message/repository";
import { newMessageService } from "~/message/service";
import { newSupabaseThreadRepository } from "~/thread/repository";
import { newThreadService } from "~/thread/service";
import { MessageSchema } from "./api.generate";

const paramsSchema = z.object({
  toolID: z.coerce.number(),
  threadID: z.coerce.number(),
});

const putSchema = z.object({
  messages: z.array(MessageSchema),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const result = paramsSchema.safeParse(params);
  const supabase: SupabaseClient<Database> = createClient(request);
  if (!result.success) {
    console.error("invalid params", JSON.stringify(result.error, null, 2));
    return new Response(null, { status: 400 });
  }
  const threadService = newThreadService(newSupabaseThreadRepository(supabase));
  const { data, error } = await threadService.get(result.data.threadID);
  if (error) {
    return new Response(null, { status: 500 });
  }
  if (!data) {
    return new Response(null, { status: 404 });
  }
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const result = paramsSchema.safeParse(params);
  const supabase: SupabaseClient<Database> = createClient(request);
  if (!result.success) {
    console.error("invalid params", JSON.stringify(result.error, null, 2));
    return new Response(null, { status: 400 });
  }
  switch (request.method) {
    case "PUT": {
      const { threadID } = result.data;
      const parsedBody = putSchema.safeParse(await request.json());
      if (!parsedBody.success) {
        console.error(
          "invalid body",
          JSON.stringify(parsedBody.error, null, 2),
        );
        return new Response(null, { status: 400 });
      }
      const messageRepository = newSupabaseMessageRepository(supabase);
      const messageService = newMessageService(messageRepository);
      console.info(
        "creating messages",
        JSON.stringify(parsedBody.data, null, 2),
      );
      const { error: threadError } = await messageService.insertMany(
        threadID,
        parsedBody.data.messages.map((m) => ({
          ...m,
          heliconeRequestID: m.requestID ?? null,
          attachedFilePath: m.attachedFilePath ?? null,
          createdAt: new Date(m.createdAt),
        })),
      );
      if (threadError) {
        console.error("error creating messages", threadError);
        return new Response(null, {
          status: 500,
          statusText: threadError.message,
        });
      }
      return new Response(null, { status: 204 });
    }
    default:
      return new Response(null, { status: 405 });
  }
};
