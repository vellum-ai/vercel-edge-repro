import { SupabaseClient } from "@supabase/supabase-js";

export async function topNMatches(
	embedding: number[],
	n: number, // Number of matches to retrieve
	supabase: SupabaseClient,
	documentIds: number[],
	contextSize = 2, // Default context size
) {
	// Retrieve top N matches
	const { data: topMatches } = await supabase
		.rpc("match_document_sections", {
			embedding,
			match_threshold: 0.7,
			document_ids: documentIds,
		})
		.select("position, document_id")
		.limit(n);
	console.log("Top matches:", topMatches);

	if (!topMatches) return "";
	// Sort matches by position
	topMatches.sort((a, b) => a.position - b.position);

	let injectedDocs = "";
	let lastFetchedPosition = -1;

	for (const [index, match] of topMatches.entries()) {
		const currentPosition = match.position;
		const documentId = match.document_id;

		// Calculate start and end positions for context
		let startPosition = Math.max(currentPosition - contextSize, 0);
		const endPosition = currentPosition + contextSize;

		// Adjust startPosition to avoid overlap
		if (startPosition <= lastFetchedPosition) {
			startPosition = lastFetchedPosition + 1;
		}

		// Update last fetched position
		lastFetchedPosition = endPosition;

		// Retrieve surrounding sections
		const { data: sections, error: sectionerror } = await supabase
			.from("document_sections")
			.select("content")
			.eq("document_id", documentId)
			.gte("position", startPosition)
			.lte("position", endPosition)
			.order("position", { ascending: true });

		if (sectionerror) {
			console.error("Error fetching context sections:", sectionerror);
			continue;
		}

		// Combine the context sections into a single string
		const contextString = sections.map((section) => section.content).join("\n");
		injectedDocs +=
			`// Retrieved Section #${index + 1}\n` + contextString + "\n\n";
	}

	return injectedDocs.trim();
}
