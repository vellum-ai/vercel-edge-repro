import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "supabase/functions/database.types";
import type { Errorable } from "~/utils/errorable";
import type { Document, DocumentSection } from "./model";

export interface DocumentRepository {
  get(documentID: number): Promise<Errorable<Document>>;
  getByPath(path: string): Promise<Errorable<Document>>;
  getContent(document: Document): Promise<Errorable<string>>;
  getSectionsByVector(
    documentIDs: number[],
    vector: number[],
    numResults: number,
  ): Promise<Errorable<DocumentSection[]>>;
  getSectionContent(
    section: DocumentSection,
    overlap: number,
  ): Promise<Errorable<string>>;
}

export function newSupabaseDocumentRepository(
  client: SupabaseClient<Database>,
): DocumentRepository {
  return {
    get: async (documentIDs) => {
      const { data, error } = await client
        .from("documents")
        .select("*")
        .eq("id", documentIDs)
        .single();
      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      if (!data) {
        return { data: null, error: new Error("Document not found") };
      }
      const doc = { id: data.id, name: data.name, processed: data.processed };
      return { data: doc, error: null };
    },
    getByPath: async (path) => {
      const { data, error } = await client
        .from("documents_with_storage_path")
        .select("id, name, processed")
        .eq("storage_object_path", path)
        .single();
      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      if (!data) {
        return { data: null, error: new Error("Document not found") };
      }
      if (!data.id || !data.name) {
        return { data: null, error: new Error("Document not found") };
      }
      const doc = {
        id: data.id,
        name: data.name,
        processed: data.processed ?? false,
      };
      return { data: doc, error: null };
    },
    getContent: async (document) => {
      const { data, error } = await client
        .from("document_sections")
        .select("content")
        .eq("document_id", document.id)
        .order("position", { ascending: true });
      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      const content = data.map(({ content }) => content).join("\n");
      return { data: content, error: null };
    },
    getSectionsByVector: async (documentIDs, vector, numResults = 2) => {
      const { data, error } = await client
        .rpc("match_document_sections", {
          embedding: `[${vector.join(",")}]`,
          match_threshold: 0.7,
          document_ids: documentIDs,
        })
        .select("position, document_id")
        .order("position", { ascending: true })
        .limit(numResults);
      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      if (!data) {
        return { data: null, error: new Error("No matches found") };
      }
      const sections = data.map(({ position, document_id }) => ({
        position,
        documentID: document_id,
      }));
      return { data: sections, error: null };
    },
    getSectionContent: async (section: DocumentSection, overlap = 2) => {
      const { data, error } = await client
        .from("document_sections")
        .select("content")
        .eq("document_id", section.documentID)
        .gte("position", Math.max(section.position - overlap, 0))
        .lte("position", section.position + overlap)
        .order("position", { ascending: true });
      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      if (!data) {
        return { data: null, error: new Error("Section not found") };
      }
      const content = data.map(({ content }) => content).join("\n");
      return { data: content, error: null };
    },
  };
}
