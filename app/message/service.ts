import type { Errorable } from "~/utils/errorable";
import type { Message, NewMessage } from "./model";
import type { MessageRepository } from "./repository";

interface MessageService {
  create: (
    threadID: number,
    message: NewMessage,
  ) => Promise<Errorable<Message>>;
  insertMany: (
    threadID: number,
    messages: Omit<Message, "id">[],
  ) => Promise<Errorable<Message[]>>;
  getAll(threadID: number): Promise<Errorable<Message[]>>;
  getLatestUserMessage(messages: Message[]): Errorable<Message>;
  update(messageID: number, content: string): Promise<Errorable<Message>>;
}

export function newMessageService(
  messageRepository: MessageRepository,
): MessageService {
  return {
    update: messageRepository.update,
    create: messageRepository.create,
    insertMany: messageRepository.insertMany,
    getAll: messageRepository.getAll,
    getLatestUserMessage: (messages: Message[]) => {
      const latestUserMessage = messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .find((m) => m.role === "user");
      if (!latestUserMessage)
        return { data: null, error: new Error("no user message exists") };
      return { data: latestUserMessage, error: null } as const;
    },
  };
}
