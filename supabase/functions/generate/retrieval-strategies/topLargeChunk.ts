import { SupabaseClient } from "@supabase/supabase-js";

export async function topLargeChunk(
	embedding: number[],
	supabase: SupabaseClient,
	document_ids: number[],
) {
	const { data: documents } = await supabase
		.rpc("match_document_sections", {
			embedding,
			match_threshold: 0.8,
			document_ids: document_ids,
		})
		.select("position, document_id")
		.limit(1);
	console.log("documents", documents);
	const injected: string[] = [];
	// based on documents[0].position, retrieve the previous 3 and next 3 sections
	// surrounding it:
	if (documents && documents.length > 0) {
		const currentPosition = documents[0].position;
		const documentId = documents[0].document_id;
		const startPosition = Math.max(currentPosition - 10, 0); // Ensure it doesn't go below 0
		const endPosition = currentPosition + 10;

		const { data: sections, error: sectionerror } = await supabase
			.from("document_sections")
			.select("content")
			.eq("document_id", documentId) // ensure it's all from the same document
			.gte("position", startPosition) // Greater than or equal to start position
			.lte("position", endPosition) // Less than or equal to end position
			.order("position", { ascending: true }); // Optional: order by position
		console.error("sectionerror", sectionerror);
		console.log("sections", sections);

		for (const section of sections) {
			injected.push(section.content);
		}
	}

	console.log("injected", injected);
	const injectedDocs = injected.join("\n");
	return injectedDocs;
}
