export type Message = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  attachedFilePath: string | null;
  heliconeRequestID: string | null;
  metadata?: {
    isInternal?: boolean;
    preuploadedContext?: string;
    attachedContext?: string;
  };
};
export type NewMessage = Omit<Message, "id" | "createdAt">;
