import { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbeddings } from "../../_shared/generateEmbeddings.ts";
import { OpenAIInterface } from "../../_shared/llms/openAIInterface.ts";
import { Database } from "../../database.types.ts";
import { model } from "../index.ts";
import { topNMatches } from "../retrieval-strategies/topMatches.ts";
import { MessageType } from "../types/message.ts";

export type DocumentStrategyArgs = {
	strategy: "retrieval" | "full_document" | "no_document_reference_needed";
	suggestedRetrievalEmbeddingSearchTerm?: string;
	stepByStepRationaleForStrategy: string;
};

async function determineDocumentStrategy(
	messages: MessageType[],
	openAIInterface: OpenAIInterface,
	lastUserMessage: MessageType,
	preuploadedDocFileNames: string[],
) {
	const content = `
  // This is the message thread so far:
  ---
  ${JSON.stringify(messages)}
  ---

  // This is the latest message:
  ---
  ${JSON.stringify(lastUserMessage)}
  ---

  You have access to the following pre-uploaded document(s): ${preuploadedDocFileNames}

  Which strategy should we use?:
  1."retrieval" for searching specific snippets; useful when asked specific questions that can potentially be found in the doc.
  2. "full_document" for reading the entire document; useful when answering the latest message requires knowing the entire gist of the preuploaded doc.
  3. "no_document_reference_needed" for not referencing any documents; useful when latest message does not require document reference (eg. the user is just saying 'hi' or something else clearly not needing a document reference.)'
`;

	const decision = await openAIInterface.generateChatCompletions({
		messages: [
			{
				role: "system",
				content: `You help determine whether or not we should search a document for snippets or to just read the
          whole document.
          `,
			},
			{
				role: "user",
				content,
			},
		],
		model: model,
		functions: [
			{
				name: "execute_strategy",
				parameters: {
					type: "object",
					properties: {
						strategy: {
							type: "string",
							enum: [
								"retrieval",
								"full_document",
								"no_document_reference_needed",
							],
							description: `
              '"retrieval" for searching specific snippets; useful when asked specific questions that can potentially be found in the doc.
              "full_document" for reading the entire document; useful when answering the latest message requires knowing the entire gist of the preuploaded doc.
              "no_document_reference_needed" for not referencing any documents.
              `,
						},
						suggestedRetrievalEmbeddingSearchTerm: {
							type: "string",
							description:
								'The suggested search term to use to retrieve the relevant snippets. Only provide this if strategy is "retrieval".',
						},
						stepByStepRationaleForStrategy: {
							type: "string",
							description:
								"Be extremely concise. Do not use complete sentences. Only provide the minimum essential information to justify the strategy.",
						},
					},
					required: ["strategy", "stepByStepRationaleForStrategy"],
				},
			},
		],

		stream: false,
	});
	const args = JSON.parse(
		decision.choices[0].message.function_call?.arguments || "",
	) as DocumentStrategyArgs;
	return args;
}

export async function getFullDocument(
	supabase: SupabaseClient,
	documentId: number | string,
) {
	const { data: documentSections } = await supabase
		.from("document_sections")
		.select("*")
		.eq("document_id", documentId)
		.order("position", { ascending: true })
		.throwOnError();

	// join all the text together from the sections:
	if (documentSections) {
		return documentSections.map(({ content }) => content).join("\n");
	}

	return "";
}

const emptyResponse = {
	injectedDocs: "",
	documentStrategy: undefined,
	preuploadedDocFileNames: [],
};

export async function handlePreUploadedDocuments(
	supabase: SupabaseClient<Database>,
	toolId: number,
	messages: MessageType[],
	openAIInterface: OpenAIInterface,
	lastUserMessage: MessageType,
) {
	// first fetch all of the pre-uploaded documents that are attached to the tool:
	const { data: documentsTools } = await supabase
		.from("documents_tools")
		.select("document_id")
		.eq("tool_id", toolId)
		.throwOnError();

	const documentIds = documentsTools?.map(({ document_id }) => document_id);

	if (!documentIds || documentIds.length === 0) {
		return emptyResponse;
	}

	// fetch the pre-uploaded file names from the database:
	const { data: preuploadedDocuments } = await supabase
		.from("documents")
		.select("*")
		.in("id", documentIds)
		.throwOnError();

	// if there are no pre-uploaded docs, just return empty responses:
	if (!preuploadedDocuments || preuploadedDocuments.length === 0) {
		return emptyResponse;
	}

	// determine whether or not we need to reference a pre-uploaded document based on the user's latest message:
	const preuploadedDocFileNames = preuploadedDocuments.map((doc) => doc.name);

	const documentStrategy = await determineDocumentStrategy(
		messages,
		openAIInterface,
		lastUserMessage,
		preuploadedDocFileNames,
	);
	const { strategy, suggestedRetrievalEmbeddingSearchTerm } = documentStrategy;
	let injectedDocs = "";
	switch (strategy) {
		case "retrieval": {
			const embedding = await generateEmbeddings(
				suggestedRetrievalEmbeddingSearchTerm || lastUserMessage.content,
			);
			injectedDocs = await topNMatches(embedding, 3, supabase, documentIds);
			break;
		}
		case "full_document": {
			const documentId = documentIds[0];
			if (!documentId) {
				throw new Error("No document id found.");
			}
			injectedDocs = await getFullDocument(supabase, documentId);
			break;
		}
		case "no_document_reference_needed":
			// Note: we don't even return the preuploadedDocFileNames to include in the call to the LLM because
			// if we do, then it confuses the model (ie. it thinks there's an empty file and that there's an error.)
			// therefore, we just return a completely empty response with injectedDocs = '' and preuploadedDocFileNames = []
			return { ...emptyResponse, documentStrategy };
		default:
			break;
	}

	return {
		injectedDocs,
		preuploadedDocFileNames,
		documentStrategy,
	};
}
