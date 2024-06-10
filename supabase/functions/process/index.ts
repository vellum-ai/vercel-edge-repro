import mammoth from "https://esm.sh/mammoth@1.6.0?target=es2022";
import { configureUnPDF, getResolvedPDFJS } from "https://esm.sh/unpdf@0.10.0";
import * as pdfjs from "https://esm.sh/unpdf@0.10.0/dist/pdfjs.mjs";
/* eslint-disable no-control-regex */
// deno-lint-ignore-file no-control-regex
import { createClient } from "@supabase/supabase-js";
import {
	DocumentParagraph,
	parseDocumentIntoParagraphs,
} from "../_shared/document-parser.ts";
import { Database } from "../database.types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
function sanitizeForPostgres(text: string) {
	// Replace null characters
	let sanitized = text.replace(/\u0000/g, "");

	// Remove non-printable and control characters (except for newline and carriage return)
	sanitized = sanitized.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "");

	return sanitized;
}

export async function convertDocxToText(buffer: ArrayBuffer): Promise<string> {
	try {
		const result = await mammoth.extractRawText({ arrayBuffer: buffer });
		return result.value;
	} catch (error) {
		console.error("Error converting DOCX to text", error);
		throw error;
	}
}

export async function convertPdfToText(
	arrayBuffer: ArrayBuffer,
): Promise<string> {
	try {
		await configureUnPDF({
			// deno-lint-ignore require-await
			pdfjs: async () => pdfjs,
		});
		const resolvedPdfJs = await getResolvedPDFJS();
		const { getDocument } = resolvedPdfJs;
		const data = new Uint8Array(arrayBuffer);

		// Get the document
		const doc = await getDocument(data).promise;
		let allText = "";

		// Iterate through each page of the document
		for (let i = 1; i <= doc.numPages; i++) {
			const page = await doc.getPage(i);
			const textContent = await page.getTextContent();

			// Combine the text items with a space (adjust as needed)
			const pageText = textContent.items
				.map((item) => {
					if ("str" in item) {
						return item.str;
					}
					return "";
				})
				.join(" ");
			allText += pageText + "\n"; // Add a newline after each page's text
		}

		return sanitizeForPostgres(allText);
	} catch (error) {
		console.error("Error converting PDF to text", error);
		throw error;
	}
}

Deno.serve(async (req) => {
	if (!supabaseUrl || !supabaseAnonKey) {
		return new Response(
			JSON.stringify({
				error: "Missing environment variables.",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const authorization = req.headers.get("Authorization");

	if (!authorization) {
		return new Response(
			JSON.stringify({ error: `No authorization header passed` }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: {
				authorization,
			},
		},
		auth: {
			persistSession: false,
		},
	});

	const { document_id } = await req.json();

	const { data: document } = await supabase
		.from("documents_with_storage_path")
		.select()
		.eq("id", document_id)
		.single();
	if (!document?.storage_object_path) {
		return new Response(
			JSON.stringify({ error: "Failed to find uploaded document" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const { data: file } = await supabase.storage
		.from("files")
		.download(document.storage_object_path);

	if (!file) {
		return new Response(
			JSON.stringify({ error: "Failed to download storage object" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	// check file type: // if it's markdown:
	//   process markdown
	// if it's docx:
	// process docx
	let fileContents = "";
	if (document.name?.endsWith(".md")) {
		fileContents = await file.text();
	} else if (document.name?.endsWith(".pdf")) {
		fileContents = await convertPdfToText(await file.arrayBuffer());
	} else if (document.name?.endsWith(".docx")) {
		fileContents = await convertDocxToText(await file.arrayBuffer());
	}

	const processedDoc: DocumentParagraph[] =
		parseDocumentIntoParagraphs(fileContents);

	const { error, data: insertedSections } = await supabase
		.from("document_sections")
		.insert(
			processedDoc.map(({ content, position }) => ({
				document_id,
				content,
				position,
			})),
		)
		.select()
		.throwOnError();

	// Prepare the data for the embed function call
	const embedFunctionData = {
		ids: insertedSections?.map((section) => section.id),
		table: "document_sections", // The name of your table
		contentColumn: "content", // The name of the content column
		embeddingColumn: "embedding", // The name of the embedding column
	};
	// helpful logs:
	console.log(
		"Asynchronously calling `embed` with the following body:",
		embedFunctionData,
	);
	// Invoke the embed function asyncronously
	supabase.functions.invoke("embed", {
		body: JSON.stringify(embedFunctionData),
	});

	if (error) {
		console.error(error);
		return new Response(
			JSON.stringify({ error: "Failed to save document sections" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
	// update documents' `processed` column to true:
	// this allows us to query for documents.processed = true && document_sections
	// where there are no embedding fields that aer empty to know whether
	// the document has been fully vectorized.
	const { error: updateError } = await supabase
		.from("documents")
		.update({ processed: true })
		.eq("id", document_id);

	if (updateError) {
		console.error(updateError);
		return new Response(
			JSON.stringify({ error: "Failed to update document" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	console.log(
		`Saved ${processedDoc.length} sections for file '${document.name}'`,
	);

	return new Response(null, {
		status: 204,
		headers: { "Content-Type": "application/json" },
	});
});
