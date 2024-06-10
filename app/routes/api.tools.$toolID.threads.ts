import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionFunction, LoaderFunction } from "@vercel/remix";
import type { Database } from "supabase/functions/database.types";
import { z } from "zod";
import { createClient } from "~/lib/supabase.server";
import {
  type ThreadRepository,
  newSupabaseThreadRepository,
} from "~/thread/repository";
import { newThreadService } from "~/thread/service";

const paramsSchema = z.object({
  toolID: z.coerce.number(),
});

export const action: ActionFunction = async ({ request, params }) => {
  const result = paramsSchema.safeParse(params);
  const supabase: SupabaseClient<Database> = createClient(request);
  if (!result.success) {
    return new Response(null, { status: 400 });
  }
  switch (request.method) {
    case "POST": {
      const { toolID } = result.data;
      const threadRepository: ThreadRepository =
        newSupabaseThreadRepository(supabase);
      const threadService = newThreadService(threadRepository);
      const { data, error: threadError } = await threadService.create(toolID);
      if (threadError) {
        return new Response(null, {
          status: 500,
          statusText: threadError.message,
        });
      }
      const threadID = data.id;
      return threadID;
    }
    default:
      return new Response(null, { status: 405 });
  }
};
