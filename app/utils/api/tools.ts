import { supabase } from "~/lib/supabase.client";
import type {
  DbResult,
  Tables,
} from "../../../supabase/functions/database-helper.types";
import type { Json } from "../../../supabase/functions/database.types";
import type { ToolContextType } from "../../context/ToolContext";
import { captureEvent } from "../metrics";
import type { ToolField } from "./apiTypes/tools";
import { removeDocumentFromTool } from "./document";
import { uploadFile } from "./file";
import { getIntegrationParameters, getIntegrationSchema } from "./teams";

export const deleteTool = async (toolID: number): Promise<Error | null> => {
  const { data } = await supabase
    .from("tools")
    .delete()
    .eq("id", toolID)
    .throwOnError();
  captureEvent("tool-deleted", { toolID: toolID });
  return data;
};

export const fetchCompleteTool = async (toolID: number) => {
  // This can actually just be one query, but will require a migration.
  const toolQuery = supabase
    .from("tools")
    .select(
      "*, tool_fields (id, tool_id, field_type, label, order_index, integration_key)",
    )
    .eq("id", toolID)
    .single();
  //fetch all the document related data
  const documentsQuery = supabase
    .from("documents_tools")
    .select("documents(id, name, storage_object_id, created_by, created_at)")
    .eq("tool_id", toolID);
  const documentsQueryResponse: DbResult<typeof documentsQuery> =
    await documentsQuery;
  const toolQueryResponse: DbResult<typeof toolQuery> = await toolQuery;
  if (!toolQueryResponse.data) throw new Error("Tool query failed");
  if (!documentsQueryResponse.data) throw new Error("Document query failed");
  //fetch all the integration related data
  let integration = undefined;
  if (toolQueryResponse.data.integration_id) {
    const integrationParameters = await getIntegrationParameters(
      toolQueryResponse.data.integration_id,
    );
    const integrationSchema = await getIntegrationSchema(
      toolQueryResponse.data.integration_id,
    );
    integration = {
      id: toolQueryResponse.data.integration_id,
      schema: integrationSchema,
      parameters:
        integrationParameters.map((parameter) => parameter.name) ?? [],
    };
  }
  const documents = documentsQueryResponse.data
    .filter((dt): dt is { documents: Tables<"documents"> } => dt !== null)
    .map((dt) => dt.documents);

  const favoriteResponse = await supabase
    .from("favorite_tools")
    .select("*")
    .eq("tool_id", toolID)
    .throwOnError();
  const isFavorited = favoriteResponse.data?.length !== 0;
  return {
    ...toolQueryResponse.data,
    documents: documents,
    isFavorited: isFavorited,
    integration: integration,
  };
};

// A full tool is a tool, its fields, and its documents
export type FullTool = Awaited<ReturnType<typeof fetchCompleteTool>>;

type saveToolParams = {
  toolID: number;
  newTitle: string;
  newDescription: string;
  newSystemPrompt: string;
  newPreuploadedFile: File | null;
  newConversationStarter: string;
  removedPreuploadedFile: FullTool["documents"][number] | null;
  integrationID: string | undefined;
};

export const saveToolAndFields = (
  params: saveToolParams & { newFields: FullTool["tool_fields"] },
) => {
  const { newFields, ...saveToolParams } = params;
  return Promise.all([
    saveTool({ ...saveToolParams }),
    updateToolFields({ toolID: params.toolID, fields: newFields }),
  ]);
};

const saveTool = async ({
  toolID,
  newTitle,
  newDescription,
  newSystemPrompt,
  newPreuploadedFile,
  removedPreuploadedFile,
  newConversationStarter,
  integrationID,
}: saveToolParams) => {
  const formData = new FormData();

  // Just one file can be uploaded right now, although the backend can support more
  if (newPreuploadedFile) {
    const filePath = await uploadFile({ file: newPreuploadedFile });
    formData.append("uploadedFilePath", filePath);
  }

  // Only one file can be removed during an update
  if (removedPreuploadedFile) {
    await removeDocumentFromTool(removedPreuploadedFile.id, toolID);
  }

  // Add updatable tool fields to request
  formData.append("id", String(toolID));
  formData.append("name", String(newTitle));

  // TODO: Fully remove the need for tool_type
  // Currently the backend requires it, but it's not used
  formData.append("tool_type", "content");

  formData.append("system_prompt", newSystemPrompt);
  formData.append("description", newDescription);
  formData.append("description", newDescription);
  formData.append("conversation_starter", newConversationStarter);
  if (integrationID) {
    formData.append("integration_id", integrationID);
  }

  try {
    const updateResponse = await supabase.functions.invoke(
      "update-content-tool",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      },
    );

    return JSON.parse(updateResponse.data);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

async function copyFieldsToTool(oldFields: ToolField[], toolID: number) {
  const newFields = oldFields.map((field) => {
    // Remove the ID from the existing fields and replace the tool_id
    // NOTE: This is a hack to get around the fact that the ID is auto-generated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...fieldWithoutID } = field;
    return { ...fieldWithoutID, tool_id: toolID };
  });
  const response = await supabase
    .from("tool_fields")
    .insert(newFields)
    .select()
    .throwOnError();
  return response.data;
}

export async function fetchFileStoragePathForDownload(storageID: string) {
  const response = await supabase
    .from("documents_with_storage_path")
    .select("storage_object_path")
    .eq("storage_object_id", storageID);
  if (response.data) {
    const object = response.data[0];
    if (object?.storage_object_path) {
      const { data } = await supabase.storage
        .from("files")
        .createSignedUrl(object.storage_object_path, 60);
      if (data) {
        return data?.signedUrl;
      }
    }
  }
  return undefined;
}

async function fetchFieldsForTool(toolID: number) {
  const response = await supabase
    .from("tool_fields")
    .select()
    .eq("tool_id", toolID)
    .throwOnError();
  return response.data;
}

// Copy and existing tool to another user's account
export async function duplicateTool(oldTool: ToolContextType, userID: string) {
  const newTool = await createTool(
    userID,
    `${oldTool.title} Duplicate`,
    oldTool.description,
    oldTool.systemPrompt,
    oldTool.conversationStarter,
    oldTool.integration?.id,
  );
  await copyFieldsToTool(
    (await fetchFieldsForTool(oldTool.id)) ?? [],
    newTool.id,
  );
  captureEvent("tool-duplicated", { toolID: newTool.id });
  return newTool;
}

export const createDefaultTool = async (userID: string) => {
  return await createTool(userID, "Untitled Tool", "", "");
};
const createTool = async (
  userID: string,
  title?: string,
  description?: string,
  systemPrompt?: string,
  conversationStarter?: string | null,
  integrationID?: string | undefined,
) => {
  const query = supabase
    .from("tools")
    .insert({
      user_id: userID,
      title: title ?? "",
      description: description ?? "",
      tool_type: "content",
      system_prompt: systemPrompt ?? "",
      assistants_id: "",
      tool_status: "unverified",
      conversation_starter: conversationStarter,
      integration_id: integrationID,
    })
    .select()
    .single();

  const res: DbResult<typeof query> = await query;
  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new Error("No data returned");
  captureEvent("tool-created", { toolID: res.data.id });
  return res.data;
};

const updateToolFields = async (params: {
  toolID: number;
  fields: FullTool["tool_fields"];
}) => {
  // Delete Existing Fields
  const { error: deleteFieldsError } = await supabase
    .from("tool_fields")
    .delete()
    .eq("tool_id", params.toolID);
  if (deleteFieldsError) {
    throw deleteFieldsError;
  }
  // Insert new fields
  const { error: insertFieldsError } = await supabase
    .from("tool_fields")
    .insert(
      params.fields.map((field) => {
        return {
          order_index: field.order_index,
          label: field.label,
          field_type: field.field_type,
          tool_id: params.toolID,
          integration_key: field.integration_key,
        };
      }),
    );
  if (insertFieldsError) {
    throw insertFieldsError;
  }
  //update update time for tools
  const { error: updateTimeError } = await supabase
    .from("tools")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", params.toolID);
  if (updateTimeError) {
    throw updateTimeError;
  }
};

export async function toggleFavoriteTools(
  tool_id: number,
  user_id: string,
  favorite: boolean,
) {
  if (favorite) {
    return await supabase
      .from("favorite_tools")
      .insert({ tool_id: tool_id, favorited_by: user_id })
      .select()
      .throwOnError();
  }
  return await supabase
    .from("favorite_tools")
    .delete()
    .eq("tool_id", tool_id)
    .eq("favorited_by", user_id)
    .throwOnError();
}

export const sendMessageRating = async (requestId: string, rating: boolean) => {
  try {
    const response = await supabase.functions.invoke("send-feedback", {
      body: {
        requestId,
        rating: rating,
        additionalFeedback: null,
      },
    });
    const { messageFeedbackId } = await JSON.parse(response.data);
    return messageFeedbackId;
  } catch (error) {
    console.error(error);
    throw new Error("Network response was not ok");
  }
};

export const UpdateMessageFeedback = async (
  additionalFeedback: string,
  messageFeedbackId: number,
) => {
  await supabase
    .from("message_feedback")
    .update({
      additional_feedback: additionalFeedback,
    })
    .eq("id", messageFeedbackId)
    .throwOnError();
};
