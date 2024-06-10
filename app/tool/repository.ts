import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "supabase/functions/database.types";
import type { Errorable } from "~/utils/errorable";
import type { Tool } from "./model";

export function newSupabaseToolRepository(client: SupabaseClient<Database>) {
  return {
    get: async (toolID: number): Promise<Errorable<Tool>> => {
      const { data, error } = await client
        .from("tools")
        .select("*, topics(id, name)")
        .eq("id", toolID)
        .maybeSingle();
      if (error) return { data: null, error: new Error(error.message) };
      if (!data) return { data: null, error: new Error("no tool found") };
      const { data: documents, error: documentsError } = await client
        .from("documents_tools")
        .select("document_id")
        .eq("tool_id", toolID);
      if (documentsError)
        return { data: null, error: new Error(documentsError.message) };
      const documentIDs = documents.map((d) => d.document_id);
      const tool: Tool = {
        id: data.id,
        authorID: data.user_id,
        documentIDs: documentIDs,
        title: data.title,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        description: data.description ?? "",
        allowFiles: data.allow_files,
        systemPrompt: data.system_prompt ?? "",
        integrationID: data.integration_id,
        status: data.tool_status,
        vellumDeploymentKey: data.vellum_deployment_key,
        vellumWorkflowKey: data.vellum_workflow_key,
        topic: data.topics[0]?.name ?? null,
      };
      return { data: tool, error: null };
    },
  };
}
export type ToolRepository = ReturnType<typeof newSupabaseToolRepository>;
