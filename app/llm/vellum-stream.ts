import {
  type AIStreamCallbacksAndOptions,
  createCallbacksTransformer,
  createStreamDataTransformer,
  readableFromAsyncIterable,
} from "ai";
import type { ExecutePromptEvent } from "vellum-ai/api";

const isStreaming = (
  e: ExecutePromptEvent,
): e is ExecutePromptEvent.Streaming => e.state === "STREAMING";

async function* streamable(stream: AsyncIterable<ExecutePromptEvent>) {
  for await (const chunk of stream) {
    if (isStreaming(chunk)) {
      yield chunk.output.value;
    }
  }
}

export function VellumStream(
  stream: AsyncIterable<ExecutePromptEvent>,
  callbacks?: AIStreamCallbacksAndOptions,
): ReadableStream {
  const transformedStream = readableFromAsyncIterable(streamable(stream));
  return transformedStream
    .pipeThrough(createCallbacksTransformer(callbacks))
    .pipeThrough(createStreamDataTransformer());
}
