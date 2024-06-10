import type { Errorable } from "~/utils/errorable";
import type { Tool } from "./model";
import type { ToolRepository } from "./repository";

interface ToolService {
  get(id: number): Promise<Errorable<Tool>>;
}

export function newToolService(repo: ToolRepository): ToolService {
  return {
    get: (id) => repo.get(id),
  };
}
