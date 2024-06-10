import { z } from "zod";
export type Tool = {
  id: number;
  authorID: string;
  title: string;
  documentIDs: number[];
  createdAt: Date;
  updatedAt: Date;
  description: string;
  allowFiles: boolean;
  systemPrompt: string;
  integrationID: string | null;
  status: "unverified" | "verified" | "official";
  vellumDeploymentKey: string | null;
  vellumWorkflowKey: string | null;
  topic: string | null;
};

export const ToolSummarySchema = z
  .object({
    id: z.number(),
    title: z.string(),
    description: z.string().default(""),
    tool_status: z.string(),
    topics: z.array(z.object({ name: z.string() })),
    updated_at: z.coerce.date().default(() => new Date()),
    favorite_tools: z.array(z.object({ tool_id: z.number() })),
  })
  .transform((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    isOfficial: t.tool_status === "official",
    isFavorite: t.favorite_tools.length > 0,
    updatedAt: t.updated_at,
    topic: t.topics[0]?.name ?? null,
  }));
