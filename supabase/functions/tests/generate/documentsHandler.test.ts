// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { getFullDocument } from "../../generate/handlers/documentsHandler.ts";

// Mock setup for SupabaseClient
const mockSupabase = {
	from: () => ({
		select: () => ({
			eq: (_columnName: string, value: any) => ({
				order: () => ({
					throwOnError: () => ({
						then: (
							callback: (value: { data: any; error?: Error }) => Promise<any>,
						) => {
							if (value === "error_condition") {
								return Promise.reject(new Error("Supabase error simulated"));
							} else if (value === "valid_document_id") {
								const mockData = [
									{ content: "Section 1" },
									{ content: "Section 2" },
									{ content: "Section 3" },
								];
								return Promise.resolve(callback({ data: mockData }));
							} else {
								return Promise.resolve(callback({ data: null }));
							}
						},
					}),
				}),
			}),
		}),
	}),
};

// Test when documentId is provided and valid
Deno.test(
	"getFullDocument should retrieve and concatenate document sections",
	async () => {
		const documentId = "valid_document_id";
		const fullDocument = await getFullDocument(mockSupabase as any, documentId);
		assertEquals(fullDocument, "Section 1\nSection 2\nSection 3");
	},
);

// Test when documentId is provided but invalid (no matching data)
Deno.test(
	"getFullDocument should return an empty string for an invalid document id",
	async () => {
		const documentId = "invalid_document_id";
		const fullDocument = await getFullDocument(mockSupabase as any, documentId);
		assertEquals(fullDocument, "");
	},
);
