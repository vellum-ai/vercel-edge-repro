export type DocumentParagraph = {
	content: string;
	position: number;
};

export function parseDocumentIntoParagraphs(
	documentText: string,
	minWordCountPerParagraph = 40,
	maxWordCountPerParagraph = 200,
): DocumentParagraph[] {
	// Step 1: Splitting the document into paragraphs
	let paragraphs = documentText.split(/\n+/);

	// Step 2: Process long paragraphs
	paragraphs = paragraphs.flatMap((paragraph) =>
		splitLongParagraph(paragraph, maxWordCountPerParagraph),
	);

	// Step 3: Process short paragraphs
	let i = 0;
	while (i < paragraphs.length) {
		let wordCount = paragraphs[i].split(/\s+/).length;
		while (wordCount < minWordCountPerParagraph && i < paragraphs.length - 1) {
			paragraphs[i] += " " + paragraphs[i + 1];
			paragraphs.splice(i + 1, 1);
			wordCount = paragraphs[i].split(/\s+/).length;
		}
		i++;
	}

	return paragraphs
		.filter(
			// filter out empty paragraphs:
			(content) => content.length > 0,
		)
		.map((content, position) => ({ content, position }));
}

function splitLongParagraph(paragraph: string, maxWordCount: number): string[] {
	const words = paragraph.split(/\s+/);
	if (words.length <= maxWordCount) {
		return [paragraph];
	}

	const midPoint = Math.floor(words.length / 2);
	const firstHalf = words.slice(0, midPoint).join(" ");
	const secondHalf = words.slice(midPoint).join(" ");

	return [
		...splitLongParagraph(firstHalf, maxWordCount),
		...splitLongParagraph(secondHalf, maxWordCount),
	];
}
