import {
  ContentCopy,
  PrintOutlined,
  ThumbDownAlt,
  ThumbDownOffAlt,
  ThumbUpAlt,
  ThumbUpOffAlt,
} from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/joy";
import type { Message as ChatMessage } from "ai";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactToPrint from "react-to-print";
import { useTool } from "~/hooks/useTool";
import theme from "~/theme";
import { captureEvent } from "~/utils/metrics";
import { sendMessageRating } from "../../../utils/api/tools";
import { ExportToGoogleDocs } from "./ExportToGoogleDocs";
import { MessageFeedbackModal } from "./MessageFeedbackModal";
import { copyMarkdownToClipboard } from "./utils";

const CustomMarkdown = lazy(() => import("../../App/CustomMarkdown"));

export function Message({
  message,
  role,
  rating,
  isStreaming,
  onMessageRatingUpdate,
}: {
  message: ChatMessage;
  role: string;
  rating: boolean | undefined;
  isStreaming: boolean;
  onMessageRatingUpdate: (
    rating: boolean | undefined,
    messageId: string,
  ) => void;
}) {
  const { id } = useTool();
  const onClickCopy = async () => {
    captureEvent("click-copy", { toolID: id });
    await copyMarkdownToClipboard(message.content);
  };
  const userMessageRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [messageFeedbackId, setMessageFeedbackId] = useState<number>(0);
  const onIconClick = (clickedRating: boolean) => {
    if (message.id) {
      sendMessageRating(message.requestID ?? "", clickedRating)
        .then((messageFeedbackId) => {
          setMessageFeedbackId(messageFeedbackId);
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    }
    setModalOpen(true);
  };

  const [isMultiLine, setIsMultiLine] = useState(false);
  useEffect(() => {
    const checkContentLength = () => {
      if (userMessageRef.current && role === "user") {
        const exceedsOneLine = userMessageRef.current.offsetHeight > 32;
        setIsMultiLine(exceedsOneLine);
      }
    };
    // Call this function on mount and when the message content changes
    checkContentLength();
    // Optionally, listen to window resize events to handle dynamic resizing
    window.addEventListener("resize", checkContentLength);
    return () => window.removeEventListener("resize", checkContentLength);
  }, [role]);
  return (
    <Box
      width="100%"
      display="flex"
      position="relative"
      borderRadius={theme.radius.sm}
      border={
        role === "user"
          ? `1px solid ${theme.palette["indigo-100"]}`
          : `1px solid ${theme.palette["indigo-50"]}`
      }
      boxShadow={theme.shadow.sm}
      sx={{
        "&:hover .actions": {
          display: isStreaming ? "none" : "flex",
        },
        backgroundColor:
          role === "user"
            ? theme.palette["indigo-100"]
            : theme.palette.background.body,
      }}
    >
      {/* Message Content */}
      <Box
        sx={(theme) => ({
          color:
            role === "user"
              ? theme.palette["indigo-900"]
              : theme.palette["gray-600"],
          width: "100%",
          fontFamily: "Open Sans",
          borderRadius: theme.radius.sm,
          padding: 3,
          position: "relative",
          display: role !== "assistant" && !isMultiLine ? "flex" : "initial",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <>
          <Box ref={userMessageRef}>
            <Suspense fallback={<div>Loading...</div>}>
              <CustomMarkdown content={message.content} />
            </Suspense>
          </Box>
          <Box
            display="flex"
            sx={{
              width:
                role !== "assistant" && !isMultiLine ? "fit-content" : "100%",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            {role !== "assistant" ? (
              <Tooltip title="Copy content" placement="bottom">
                <IconButton onClick={onClickCopy}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            ) : null}

            {/* Only assistant messages can be printed */}
            {role === "assistant" && (
              <>
                <Tooltip title="Copy content" placement="bottom">
                  <IconButton onClick={onClickCopy}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                <ExportToGoogleDocs content={message.content} />
                <ReactToPrint
                  onBeforePrint={() => {
                    captureEvent("click-print", { toolID: id });
                  }}
                  trigger={() => (
                    <Tooltip title="Print content" placement="bottom">
                      <IconButton>
                        <PrintOutlined />
                      </IconButton>
                    </Tooltip>
                  )}
                  content={() => userMessageRef.current}
                  pageStyle={"@page{margin:50px}"}
                />
                <Tooltip title="Good Response" placement="bottom">
                  <IconButton>
                    {rating === true ? (
                      <ThumbUpAlt
                        onClick={() => {
                          if (message.id) {
                            onMessageRatingUpdate(undefined, message.id);
                          }
                        }}
                      />
                    ) : (
                      <ThumbUpOffAlt
                        onClick={() => {
                          if (message.id) {
                            onMessageRatingUpdate(true, message.id);
                          }
                          onIconClick(true);
                          captureEvent("click-response-good", { toolID: id });
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bad Response" placement="bottom">
                  <IconButton>
                    {rating === false ? (
                      <ThumbDownAlt
                        onClick={() => {
                          if (message.id) {
                            onMessageRatingUpdate(undefined, message.id);
                          }
                        }}
                      />
                    ) : (
                      <ThumbDownOffAlt
                        onClick={() => {
                          if (message.id) {
                            onMessageRatingUpdate(false, message.id);
                          }
                          captureEvent("click-response-bad", { toolID: id });
                          onIconClick(false);
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
                <MessageFeedbackModal
                  setModalOpen={setModalOpen}
                  modalOpen={modalOpen}
                  rating={rating}
                  messageFeedbackId={messageFeedbackId}
                />
              </>
            )}
          </Box>
        </>
      </Box>
    </Box>
  );
}
