import { OpenAIStream, StreamingTextResponse } from "ai";
import type { Message } from "ai";
import type OpenAI from "openai";
import { APIError } from "openai";
import type { Document } from "~/document/model";
import { MODEL_NAME } from "~/server/openai/builder";
import type { Errorable } from "~/utils/errorable";
import {
  type DocumentStrategy,
  getDocumentStrategySchema,
  getDocumentStrategyTool,
} from "./functions";

export interface LLMService {
  getTokenStream(opts: {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    onCompletion: (fullResponse: string) => Promise<void>;
    onStart: () => Promise<void>;
  }): Promise<StreamingTextResponse>;
  createEmbedding(input: string): Promise<Errorable<number[]>>;
  getDocumentStrategy(
    history: Message[],
    documents: Document[],
  ): Promise<Errorable<DocumentStrategy>>;
}

export function newLLMService(openai: OpenAI): LLMService {
  return {
    getTokenStream: async ({ messages, onCompletion, onStart }) => {
      const stream = await openai.chat.completions.create({
        stream: true,
        model: MODEL_NAME,
        messages,
      });
      return new StreamingTextResponse(
        OpenAIStream(stream, {
          onCompletion,
          onStart,
        }),
      );
    },
    createEmbedding: async (input) => {
      try {
        const res = await openai.embeddings.create({
          input,
          model: "text-embedding-ada-002",
        });
        const embeddings = res.data.map((d) => d.embedding);
        const embedding = embeddings[0];
        console.info("create embedding", "embedding", embedding);
        if (!embedding) {
          return {
            data: null,
            error: new Error("failed to generate embedding"),
          };
        }
        return { data: embedding, error: null };
      } catch (e) {
        return { data: null, error: new Error("failed to generate embedding") };
      }
    },
    getDocumentStrategy: async (messageHistory, documents) => {
      const messagesContext = getMessageContext(messageHistory);
      const documentsContext = getDocumentsContext(
        documents.map((doc) => doc.name),
      );
      const userMessage = {
        role: "user",
        content: messagesContext + documentsContext,
      } as const;
      const systemMessage = {
        role: "system",
        content:
          "You help determine whether or not we should search a document for snippets or to just read the whole document.",
      } as const;
      try {
        const response = await openai.chat.completions.create({
          messages: [systemMessage, userMessage],
          model: MODEL_NAME,
          tools: [getDocumentStrategyTool],
          stream: false,
          tool_choice: getDocumentStrategyTool,
        });
        const functionCall =
          response.choices[0]?.message.tool_calls?.[0]?.function;
        if (!functionCall) {
          return { data: null, error: new Error("no response from openai") };
        }
        const validationResult = getDocumentStrategySchema.safeParse(
          JSON.parse(functionCall.arguments),
        );
        if (!validationResult.success) {
          return {
            data: null,
            error: new Error("invalid response from OpenAI"),
          };
        }
        return { data: validationResult.data, error: null };
      } catch (e) {
        if (e instanceof APIError && e.code === "context_length_exceeded") {
          return { data: null, error: new Error("context length exceeded") };
        }
        return { data: null, error: new Error("unknown error") };
      }
    },
  };
}

function getDocumentsContext(documentFileNames: string[]) {
  return `
  You have access to the following pre-uploaded document(s): ${documentFileNames}
  Which strategy should we use?:
  1."retrieval" for searching specific snippets; useful when asked specific questions that can potentially be found in the doc.
  2. "full_document" for reading the entire document; useful when answering the latest message requires knowing the entire gist of the preuploaded doc.
  3. "no_document_reference_needed" for not referencing any documents; useful when latest message does not require document reference (eg. the user is just saying 'hi' or something else clearly not needing a document reference.)'`;
}

function getMessageContext(messages: Message[]): string {
  return `
	  // This is the message thread so far:
	  ${messages
      .map(
        (msg) => `${msg.role}@${msg.createdAt?.toUTCString()}: ${msg.content}`,
      )
      .join("\n")}
	`;
}
