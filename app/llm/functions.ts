import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { z } from "zod";

export const getDocumentStrategySchema = z.object({
  strategy: z.enum([
    "retrieval",
    "full_document",
    "no_document_reference_needed",
  ]),
  searchTerm: z.string().optional(),
  stepByStepRationaleForStrategy: z.string(),
});

export type DocumentStrategy = z.infer<typeof getDocumentStrategySchema>;
export const getDocumentStrategyTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "execute_strategy",
    parameters: {
      type: "object",
      properties: {
        strategy: {
          type: "string",
          enum: ["retrieval", "full_document", "no_document_reference_needed"],
          description: `
              '"retrieval" for searching specific snippets; useful when asked specific questions that can potentially be found in the doc.
              "full_document" for reading the entire document; useful when answering the latest message requires knowing the entire gist of the preuploaded doc.
              "no_document_reference_needed" for not referencing any documents.
              `,
        },
        searchTerm: {
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
};
