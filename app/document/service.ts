import type { Errorable } from "~/utils/errorable";
import type { Document } from "./model";
import type { DocumentRepository } from "./repository";

export interface DocumentService {
  get(documentID: number): Promise<Errorable<Document>>;
  getContent(document: Document): Promise<Errorable<string>>;
  getByPath(path: string): Promise<Errorable<Document>>;
  getRelevantContent(
    documents: number[],
    embedding: number[],
  ): Promise<Errorable<string[]>>;
}

export function newDocumentService(repo: DocumentRepository): DocumentService {
  return {
    get: repo.get,
    getContent: repo.getContent,
    getByPath: repo.getByPath,
    getRelevantContent: async (documents: number[], embedding: number[]) => {
      console.info("get relevant content", "documents", documents);
      const relevantSections = await repo.getSectionsByVector(
        documents,
        embedding,
        5,
      );
      console.log(
        "relevantSections",
        relevantSections,
        "error",
        relevantSections.error,
      );
      if (relevantSections.error) {
        return { error: null, data: [] };
      }
      const sectionContents = await Promise.all(
        relevantSections.data.map((match) => repo.getSectionContent(match, 2)),
      );
      return { error: null, data: sectionContents.map((c) => c.data ?? "") };
    },
  };
}
