import posthog from "posthog-js";

// ToolEvents are associated with a specific tool, but not a thread
type ToolEvent = {
  toolID: number;
};

// ThreadEvents are associated with a specific thread
type ThreadEvent = {
  toolID: number;
  threadID: string;
};

type ErrorEvent = {
  error: string;
  trace?: string;
};

// EmptyEvent is not associated to any tool or thread
type EmptyEvent = Record<string, never>;

type EventTypes = {
  "tool-created": ToolEvent;
  "tool-updated": ToolEvent;
  "tool-deleted": ToolEvent;
  "tool-duplicated": ToolEvent;
  "thread-created": ThreadEvent;
  "thread-updated": ThreadEvent;
  "thread-shared": ThreadEvent;
  "thread-deleted": ThreadEvent;
  "error-render": ErrorEvent;
  "error-query": ErrorEvent;
  "error-mutation": ErrorEvent;

  "click-generate": ToolEvent;
  "send-message": ToolEvent;
  "click-duplicate": ToolEvent;
  "click-create-new": EmptyEvent;
  "click-save": ToolEvent;
  "click-copy": ToolEvent;
  "click-print": ToolEvent;
  "click-share": ToolEvent;
  "click-edit": ToolEvent;
  "click-response-good": ToolEvent;
  "click-response-bad": ToolEvent;
};

/* captureEvent is a small type-safe wrapper around the Posthog API to ensure
 * uniformity in what data is associated with events */
export function captureEvent<K extends keyof EventTypes>(
  eventName: K,
  data: EventTypes[K],
): void {
  posthog.capture(eventName, data);
}
