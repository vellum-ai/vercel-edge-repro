import { type ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import { UnifiedToolView } from "~/components/Tools/UnifiedToolView";
import { supabase as client } from "~/lib/supabase.client";
import { newToolHandler } from "~/tool/handler";

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) =>
  newToolHandler(client)(params);
clientLoader.hydrate = true;

export default function Tool() {
  const serverData = useLoaderData<typeof clientLoader>();
  return <UnifiedToolView toolID={serverData.tool.id} />;
}
