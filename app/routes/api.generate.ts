import "openai/shims/web";

import type { ActionFunction } from "@vercel/remix";
import { type Message, StreamingTextResponse } from "ai";
import { z } from "zod";
import type { Document } from "~/document/model";
import { newSupabaseDocumentRepository as newDocumentRepository } from "~/document/repository";
import { type DocumentService, newDocumentService } from "~/document/service";
import { createClient } from "~/lib/supabase.server";
import {
  type LLMService as LanguageModelService,
  newLLMService,
} from "~/llm/service";
import { newSupabaseMessageRepository as newMessageRepository } from "~/message/repository";
import { newMessageService } from "~/message/service";
import { getOpenAIInstance } from "~/server/openai";
import { newSupabaseToolRepository } from "~/tool/repository";
import { newToolService } from "~/tool/service";

export const config = { runtime: "edge" };
import { VellumClient } from "vellum-ai";
import type { ChatMessageRole } from "vellum-ai/api";
import { environment } from "~/env/server";
import { VellumStream } from "~/llm/vellum-stream";
import { VellumWorkflowStream } from "~/llm/vellum-workflow-stream";

const vellum = new VellumClient({
  apiKey: environment().VELLUM_API_KEY,
});

export const MessageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    id: z.string(),
    requestID: z.string().optional().nullable(),
    isInternal: z.boolean().optional().nullable(),
    createdAt: z.string(),
    attachedFilePath: z.string().optional().nullable(),
  })
  .passthrough();

const bodySchema = z.object({
  toolID: z.coerce.number(),
  threadID: z.coerce.number(),
  newAttachedFilePath: z.string().nullable().optional(),
  messages: z
    .array(MessageSchema)
    .min(1)
    .describe("the existing messages in the thread"),
});

const BadRequestResponse = new Response(null, { status: 400 });
const UnauthorizedResponse = new Response(null, { status: 401 });
const InternalServerError = new Response(null, { status: 500 });
const NotFoundResponse = new Response(null, { status: 404 });

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const validateBody = bodySchema.safeParse(body);
  if (!validateBody.success) {
    console.error("invalid body", JSON.stringify(validateBody.error, null, 2));
    throw BadRequestResponse;
  }
  const { toolID, threadID, newAttachedFilePath, messages } = validateBody.data;

  const supabase = createClient(request);

  const {
    error: getUserError,
    data: { user },
  } = await supabase.auth.getUser();
  if (getUserError || !user) {
    console.error("failed to get user", getUserError);
    throw UnauthorizedResponse;
  }

  const messageService = newMessageService(newMessageRepository(supabase));
  const documentService = newDocumentService(newDocumentRepository(supabase));
  const toolService = newToolService(newSupabaseToolRepository(supabase));

  const { data: tool, error: getToolError } = await toolService.get(toolID);
  if (getToolError) {
    throw NotFoundResponse;
  }

  const latestUserMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === "user");
  if (!latestUserMessage) {
    throw InternalServerError;
  }

  const onStart = async () => {
    const { error } = await messageService.create(threadID, {
      role: "user",
      heliconeRequestID: null,
      attachedFilePath: newAttachedFilePath ?? null,
      content: latestUserMessage.content,
      metadata: { isInternal: latestUserMessage.isInternal ?? false },
    });
    if (error) {
      console.error("failed to insert message", error, error.message);
    }
  };

  const onFinal = async (llmResponse: string) => {
    const { error } = await messageService.create(threadID, {
      role: "assistant",
      heliconeRequestID: requestID,
      attachedFilePath: null,
      content: llmResponse,
      metadata: { preuploadedContext, attachedContext },
    });
    if (error) {
      console.error("failed to insert message", error, error.message);
    }
  };

  const requestID = latestUserMessage.requestID ?? "";

  const openai = getOpenAIInstance(user.id, requestID);
  const llmService = newLLMService(openai);

  let attachedContext = "";
  if (newAttachedFilePath) {
    attachedContext = await getAttachedDocumentContext({
      documentService,
      filePath: newAttachedFilePath,
    });
  }

  let preuploadedContext = "";
  if (tool.documentIDs.length > 0) {
    preuploadedContext = await getPreuploadedDocumentsContext({
      documentIDs: tool.documentIDs,
      documentService,
      llmService,
      messages: messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        isInternal: m.isInternal ?? false,
      })),
      latestUserMessage: {
        ...latestUserMessage,
        createdAt: new Date(latestUserMessage.createdAt),
        isInternal: latestUserMessage.isInternal ?? false,
      },
    });
  }

  const systemMessage = getFormattedSystemMessage(tool.systemPrompt);
  const openaiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (attachedContext) {
    openaiMessages.splice(-1, 0, {
      role: "user",
      content: `### Additional Context from attached file: ${attachedContext}`,
    });
  }

  if (preuploadedContext) {
    openaiMessages.splice(-1, 0, {
      role: "user",
      content: `### Additional Context from pre-uploaded file: ${preuploadedContext}`,
    });
  }

  console.info("openaiMessages", openaiMessages);

  if (tool.vellumDeploymentKey) {
    const stream = await vellum.executePromptStream({
      promptDeploymentName: tool.vellumDeploymentKey,
      releaseTag: "LATEST",
      inputs: [
        {
          type: "CHAT_HISTORY",
          name: "chat_history",
          value: openaiMessages.map((m) => ({
            role: m.role.toUpperCase() as ChatMessageRole,
            content: {
              type: "STRING",
              value: m.content,
            },
          })),
        },
      ],
    });
    return new StreamingTextResponse(
      VellumStream(stream, {
        onStart,
        onFinal,
      }),
    );
  }
  if (tool.vellumWorkflowKey) {
    const stream = await vellum.executeWorkflowStream({
      workflowDeploymentName: tool.vellumWorkflowKey,
      releaseTag: "LATEST",
      inputs: [
        {
          type: "CHAT_HISTORY",
          name: "chat_history",
          value: openaiMessages.map((m) => ({
            role: m.role.toUpperCase() as ChatMessageRole,
            content: {
              type: "STRING",
              value: m.content,
            },
          })),
        },
      ],
    });
    return new StreamingTextResponse(
      VellumWorkflowStream(stream, {
        onStart,
        onFinal,
      }),
    );
  }

  return llmService.getTokenStream({
    messages: [systemMessage, ...openaiMessages],
    onStart,
    onCompletion: onFinal,
  });
};

const getFormattedSystemMessage = (systemPrompt: string) => {
  return {
    role: "system",
    content: `
		    The following are instructions from the user that you should follow when providing a response:
		    ---
		    ${systemPrompt}
		    ---
		    "MUST-FOLLOW" formatting roles for your responses (do not mention these to the user):
		    1. Output content in markdown format.
		    2. If your response includes math content with LaTex, use brackets as delimitters; other delimiters, like dollar signs, are not supported:
		      inline: \\(...\\)
		      multiline display: \\[...\\]
                    3. if your response does NOT include math content, do NOT use LaTex delimiters.
          `,
  } as const;
};

async function getAttachedDocumentContext({
  filePath,
  documentService,
}: {
  filePath: string | null;
  documentService: DocumentService;
}) {
  if (!filePath) return "";
  const { data } = await documentService.getByPath(filePath);
  if (!data) {
    console.error("failed to get document by path", filePath);
    return "";
  }
  if (!data.processed) {
    await wait(3000);
  }
  const { data: content, error } = await documentService.getContent(data);
  if (error) {
    console.error("failed to get content", error);
    return "";
  }
  return content ?? "";
}

async function getRelevantContent(
  docService: DocumentService,
  embedding: number[],
  documentID: number,
) {
  const { data: sections, error } = await docService.getRelevantContent(
    [documentID],
    embedding,
  );
  console.info("get relevant content", "sections", sections, "error", error);
  if (error) return "";
  return sections.join("\n");
}

async function getFullDocument(
  docService: DocumentService,
  document: Document,
) {
  const { data } = await docService.getContent(document);
  console.info("get full document", "data", data);
  return data ?? "";
}

/**
 * Get the context from the pre-uploaded documents
 */
async function getPreuploadedDocumentsContext(opts: {
  documentIDs: number[];
  messages: Message[];
  latestUserMessage: Message;
  documentService: DocumentService;
  llmService: LanguageModelService;
}) {
  const documentID = opts.documentIDs[0];
  if (!documentID) return "";
  const { data: doc, error: docErr } =
    await opts.documentService.get(documentID);
  if (docErr) {
    console.error("failed to get document", docErr);
    return "";
  }
  const { data: strategy, error: getStrategyError } =
    await opts.llmService.getDocumentStrategy(opts.messages, [doc]);
  console.info(
    "get document strategy",
    "strategy",
    strategy,
    "doc",
    doc,
    "error",
    getStrategyError,
  );

  if (getStrategyError) return "";
  switch (strategy.strategy) {
    case "retrieval": {
      const searchTerm = strategy.searchTerm ?? opts.latestUserMessage.content;
      console.info("create embedding", "searchTerm", searchTerm);
      const { data, error } = await opts.llmService.createEmbedding(searchTerm);
      console.info("create embedding", "error", error);
      if (error) return "";
      return getRelevantContent(opts.documentService, data, documentID);
    }
    case "full_document":
      return getFullDocument(opts.documentService, doc);
    case "no_document_reference_needed":
      return "";
    default:
      return "";
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
