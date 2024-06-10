import type { ActionFunctionArgs } from "@vercel/remix";
import { z } from "zod";
import { createClient } from "~/lib/supabase.server";

const ParamsSchema = z.object({
  userID: z.string(),
});

export const action = async (args: ActionFunctionArgs) => {
  const safeParams = ParamsSchema.safeParse(args.params);
  if (safeParams.error) {
    return new Response(null, { status: 400 });
  }
  const { userID } = safeParams.data;
  const method = args.request.method;
  const client = createClient(args.request);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return new Response(null, { status: 403 });
  }

  if (method === "GET") {
    await client.from("favorite_tools").select("id").match({
      favorited_by: userID,
    });
    return new Response(null, { status: 201 });
  }
  return new Response(null, { status: 405 });
};
