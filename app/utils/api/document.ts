import { supabase } from "../../lib/supabase.client";

// delete the documents_tools entry
export async function removeDocumentFromTool(
  documentId: number,
  toolId: number,
): Promise<null> {
  const { error } = await supabase
    .from("documents_tools")
    .delete()
    .eq("document_id", documentId)
    .eq("tool_id", toolId);

  if (error) {
    // TODO: implement better error handling
    console.error(error);
    throw error;
  }
  // no return values after delete:
  return null;
}
