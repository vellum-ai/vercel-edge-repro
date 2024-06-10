import type { Tables } from "../../../../supabase/functions/database-helper.types";
import type { Json } from "../../../../supabase/functions/database.types";

export enum ToolStatus {
  official = "official",
  verified = "verified",
}

export type ToolField = Tables<"tool_fields">;
export type IntegrationField = Omit<
  ToolField,
  "id" | "tool_id" | "order_index"
> & { value: string };
