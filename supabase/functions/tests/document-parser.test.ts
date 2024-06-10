// Import required libraries and modules
import { assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { parseDocumentIntoParagraphs } from "../_shared/document-parser.ts";
import { convertDocxToText, convertPdfToText } from "../process/index.ts";

const setupParagraphs = async (filePath: string) => {
	const fileContent = await Deno.readTextFile(filePath);
	return fileContent;
};

const setupParagraphsFromDocxFile = async (filePath: string) => {
	// get the file from local disk and open as Blob:
	const file = await Deno.readFile(filePath);
	const blob = {
		arrayBuffer: () => file.buffer,
	};
	const fileContents = await convertDocxToText(await blob.arrayBuffer());
	return fileContents;
};

const setupParagraphsFromPdfFile = async (filePath: string) => {
	// get the file from local disk and open as Blob:
	const file = await Deno.readFile(filePath);
	const blob = {
		arrayBuffer: () => file.buffer,
	};
	const fileContents = await convertPdfToText(await blob.arrayBuffer());
	return fileContents;
};

// read all files from the test-files directory:
try {
	for await (const file of Deno.readDir(
		"./supabase/functions/tests/test-files",
	)) {
		Deno.test(`it parses ${file.name} file into paragraphs`, async () => {
			const filePath = `./supabase/functions/tests/test-files/${file.name}`;
			let fileContents = "";
			if (file.name.endsWith(".docx")) {
				fileContents = await setupParagraphsFromDocxFile(filePath);
			} else if (file.name.endsWith(".pdf")) {
				fileContents = await setupParagraphsFromPdfFile(filePath);
			} else {
				fileContents = await setupParagraphs(filePath);
			}
			const paragraphs = parseDocumentIntoParagraphs(fileContents);
			assert(paragraphs.length > 0);
			// confirm that none of the paragraphs are empty:
			for (const paragraph of paragraphs) {
				assert(paragraph.content.length > 0);
				assert(paragraph.position > -1);
			}
		});
	}
} catch (error) {
	console.error("Error reading directory:", error);
}
