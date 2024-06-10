import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { createClient } from "~/lib/supabase.server";
import { newSupabaseToolRepository } from "~/tool/repository";
import { newToolService } from "~/tool/service";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const supabase = createClient(request);
  const toolRepo = newSupabaseToolRepository(supabase);
  const toolService = newToolService(toolRepo);
  const toolID = Number(params.toolID);
  const tool = await toolService.get(toolID);
  return json({
    tool,
  });
};
