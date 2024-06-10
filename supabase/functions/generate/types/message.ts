import { Json } from "../../database.types.ts";

export type MessageType = {
	role: "user" | "assistant" | "system";
	content: string;
	metadata: Record<string, Json>;
};
