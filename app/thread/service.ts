import type { Errorable } from "~/utils/errorable";
import type { Thread } from "./model";
import type { ThreadRepository } from "./repository";

interface ThreadService {
  create: (toolID: number) => Promise<Errorable<Thread>>;
  get: (threadID: number) => Promise<Errorable<Thread | null>>;
}

export function newThreadService(
  threadRepository: ThreadRepository,
): ThreadService {
  return {
    create: async (toolID: number) => threadRepository.create(toolID),
    get: async (threadID: number) => threadRepository.get(threadID),
  };
}
