import { usePrevious } from "@dnd-kit/utilities";
import type { Message as ChatMessage } from "ai";
import { Message } from "./Message";
import { MessageLoading } from "./MessageLoading";

export function Messages({
  messages,
  messageLoading,
  messageRatings,
  isStreaming,
  onMessageRatingUpdate,
}: {
  messages: ChatMessage[];
  messageLoading: boolean;
  messageRatings: Record<string, boolean | undefined>;
  isStreaming: boolean;
  onMessageRatingUpdate: (
    rating: boolean | undefined,
    messageId: string,
  ) => void;
}) {
  const previousMessages = usePrevious(messages);
  const onLastChatElementMounted = (lastChatElement: HTMLDivElement) => {
    const newMessageAdded = previousMessages?.length !== messages.length;
    if (newMessageAdded) {
      lastChatElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <>
      {messages
        .filter((message) => !!message.content)
        .filter((message) => !message.isInternal)
        .map((message, i) => {
          const requestID = i > 0 ? messages[i - 1]?.requestID : "";
          return i === messages.length - 1 ? (
            <div
              ref={(e) => e && onLastChatElementMounted(e)}
              key={message.content}
            >
              <Message
                message={{ ...message, requestID }}
                rating={messageRatings[message.id]}
                role={message.role}
                isStreaming={isStreaming}
                onMessageRatingUpdate={onMessageRatingUpdate}
              />
            </div>
          ) : (
            <Message
              key={message.id}
              rating={messageRatings[message.id]}
              message={{ ...message, requestID }}
              role={message.role}
              isStreaming={isStreaming}
              onMessageRatingUpdate={onMessageRatingUpdate}
            />
          );
        })}
      {messageLoading && <MessageLoading />}
    </>
  );
}
