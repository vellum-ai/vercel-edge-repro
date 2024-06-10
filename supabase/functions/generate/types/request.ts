import { MessageType } from "./message.ts";

export type ReqJSON = {
	toolId: number;
	threadId?: number;
	userMessage: MessageType;
	attachedFilePath?: string;
};
