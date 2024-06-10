import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { UnifiedToolView } from "~/components/Tools/UnifiedToolView";
import { createClient } from "~/lib/supabase.server";
import { newToolHandler } from "~/tool/handler";

export const loader = async ({ request, params }: LoaderFunctionArgs) =>
  newToolHandler(createClient(request))(params);

export default function Tool() {
  const serverData = useLoaderData<typeof loader>();
  return <UnifiedToolView toolID={serverData.tool.id} />;
}
