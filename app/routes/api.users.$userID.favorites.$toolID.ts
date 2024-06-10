import { type ActionFunctionArgs, json } from "@vercel/remix";
import { z } from "zod";
import { createClient } from "~/lib/supabase.server";

const ParamsSchema = z.object({
  toolID: z.coerce.number(),
  userID: z.string(),
});

export const action = async (args: ActionFunctionArgs) => {
  const safeParams = ParamsSchema.safeParse(args.params);
  if (safeParams.error) {
    return json({ error: safeParams.error, message: null }, { status: 400 });
  }
  const { toolID, userID } = safeParams.data;
  const method = args.request.method;
  const client = createClient(args.request);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return json(
      { error: "You must be logged in to favorite a tool", message: null },
      { status: 401 },
    );
  }

  if (method === "POST") {
    await client.from("favorite_tools").insert({
      tool_id: toolID,
      favorited_by: userID,
    });
    return json(
      { message: "Added to Favorites", error: null },
      { status: 201 },
    );
  }

  if (method === "DELETE") {
    await client.from("favorite_tools").delete().match({
      tool_id: toolID,
      favorited_by: userID,
    });
    return json(
      { message: "Removed from Favorites", error: null },
      { status: 200 },
    );
  }

  return json({ error: "Method not allowed", message: null }, { status: 405 });
};
