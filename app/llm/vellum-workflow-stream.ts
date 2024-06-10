import {
  type AIStreamCallbacksAndOptions,
  createCallbacksTransformer,
  createStreamDataTransformer,
  readableFromAsyncIterable,
} from "ai";
import type { WorkflowStreamEvent } from "vellum-ai/api";
import type { WorkflowResultEventOutputData } from "vellum-ai/api";

const isWorkflowEvent = (
  e: WorkflowStreamEvent,
): e is WorkflowStreamEvent.Workflow => e.type === "WORKFLOW";

const isStringOutput = (
  e: WorkflowResultEventOutputData | undefined,
): e is WorkflowResultEventOutputData.String => e?.type === "STRING";

const isWorkflowStreaming = (e: WorkflowStreamEvent.Workflow): boolean =>
  e.data.state === "STREAMING";

async function* streamable(stream: AsyncIterable<WorkflowStreamEvent>) {
  for await (const chunk of stream) {
    if (!isWorkflowEvent(chunk)) continue;
    if (!isWorkflowStreaming(chunk)) continue;
    if (!isStringOutput(chunk.data.output)) continue;
    if (!chunk.data.output.delta) continue;
    yield chunk.data.output.delta;
  }
}

export function VellumWorkflowStream(
  stream: AsyncIterable<WorkflowStreamEvent>,
  callbacks?: AIStreamCallbacksAndOptions,
): ReadableStream {
  const transformedStream = readableFromAsyncIterable(streamable(stream));
  return transformedStream
    .pipeThrough(createCallbacksTransformer(callbacks))
    .pipeThrough(createStreamDataTransformer());
}
