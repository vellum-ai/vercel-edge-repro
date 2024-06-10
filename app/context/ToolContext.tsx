import { createContext } from "react";
import { ToolStatus } from "../utils/api/apiTypes/tools";
import type { FullTool } from "../utils/api/tools.ts";

export type ToolContextType = {
  id: number;
  authorID: string;
  title: string;
  description: string;
  isOfficial: boolean;
  isVerified: boolean;
  isFavorited: boolean;
  updatedAt: Date;
  createdAt: Date;
  fields: FullTool["tool_fields"];
  documents: FullTool["documents"];
  systemPrompt: string;
  allowFileUpload: boolean;
  conversationStarter: string;
  integrationID: string | undefined;
  integration:
    | {
        id: string;
        schema: string[];
        parameters: string[];
      }
    | undefined;
};

export const ToolContext = createContext<ToolContextType>({
  id: -1,
  title: "",
  authorID: "",
  isVerified: false,
  isOfficial: false,
  isFavorited: false,
  updatedAt: new Date(),
  createdAt: new Date(),
  fields: [],
  description: "",
  systemPrompt: "",
  allowFileUpload: false,
  documents: [],
  conversationStarter: "",
  integrationID: undefined,
  integration: undefined,
});

export const ToolProvider: React.FC<{
  children: React.ReactNode;
  value: FullTool;
}> = (props) => {
  return (
    <ToolContext.Provider
      value={{
        documents: props.value.documents,
        id: props.value.id,
        title: props.value.title,
        authorID: props.value.user_id,
        fields: props.value.tool_fields,
        description: props.value.description || "",
        isVerified: props.value.tool_status === ToolStatus.verified,
        isOfficial: props.value.tool_status === ToolStatus.official,
        isFavorited: props.value.isFavorited,
        createdAt: new Date(props.value.created_at),
        updatedAt: props.value.updated_at
          ? new Date(props.value.updated_at)
          : new Date(),
        systemPrompt: props.value.system_prompt,
        allowFileUpload: props.value.allow_files,
        conversationStarter: props.value.conversation_starter || "",
        integrationID: props.value.integration_id || undefined,
        integration: props.value.integration,
      }}
    >
      {props.children}
    </ToolContext.Provider>
  );
};
