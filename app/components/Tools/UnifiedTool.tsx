import { Box, useTheme } from "@mui/joy";
import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { useRevalidator } from "@remix-run/react";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { clientEnvironment } from "~/env/client";
import { useSession } from "~/hooks/useSession";
import type { loader } from "~/routes/tools.$toolID.threads.$threadID";
import { authenticatedFetch } from "~/utils/authenticated-fetch";
import { captureEvent } from "~/utils/metrics";
import { useTool } from "../../hooks/useTool";
import { uploadFile } from "../../utils/api/file";
import { ToolEditor } from "./Editor/ToolEditor";
import { MessageInputField } from "./Messages/MessageInputField";
import { Messages } from "./Messages/Messages";
import { PrivacyDisclaimer } from "./PrivacyDisclaimer";
import { ToolDisplay } from "./ToolDisplay";
import { buildUserMessageFromFields } from "./utils";

function getWelcomeMessage(starter: string) {
  if (!starter) return [];
  return [
    {
      content: starter,
      role: "assistant" as const,
      id: "0",
      attachedFilePath: null,
      requestID: crypto.randomUUID(),
    },
  ];
}

async function generateThreadID(toolID: number) {
  const response = await authenticatedFetch(`/api/tools/${toolID}/threads`, {
    method: "POST",
  });
  return await response.text();
}

async function insertMessages(
  toolID: string,
  threadID: string,
  messages: Message[],
) {
  try {
    await authenticatedFetch(`/api/tools/${toolID}/threads/${threadID}`, {
      method: "PUT",
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    console.error(e);
  }
}

const TOOL_MAX_WIDTH = 880;
export type StreamStatus = "idle" | "pending" | "processing";
export function UnifiedTool() {
  const serverData = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const { threadID } = useParams();
  const currentThread = serverData.thread;
  const navigate = useNavigate();
  const tool = useTool();
  const theme = useTheme();
  const { session, isAuthenticated } = useSession();
  const [messageRatings, setMessageRatings] = useState<
    Record<string, boolean | undefined>
  >({});
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParameters.has("editMode"));
  const [userUploadedFile, setUserUploadedFile] = useState<File | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");

  const conversationStarter: Message[] = useMemo(
    () => getWelcomeMessage(tool.conversationStarter),
    [tool.conversationStarter],
  );

  const messageHistory = useMemo(
    () =>
      serverData.messages.map(
        (m) =>
          ({
            id: m.id.toString(),
            role: m.role,
            createdAt: m.createdAt,
            requestID: m.requestID ?? null,
            attachedFilePath: m.attachedFilePath ?? null,
            content: m.content,
            isInternal: m.isInternal,
          }) as Message,
      ),
    [serverData.messages],
  );

  const {
    messages: chatMessages,
    handleInputChange,
    setInput,
    stop,
    setMessages: setChatMessages,
    isLoading,
    input,
    append,
    reload,
  } = useChat({
    headers:
      clientEnvironment.TARGET === "extension"
        ? { Authorization: `Bearer ${session?.access_token}` }
        : {},
    initialMessages: conversationStarter.concat(messageHistory),
    api: `${clientEnvironment.SITE_URL}/api/generate`,
    sendExtraMessageFields: true,
    onFinish: () => setStreamStatus("idle"),
    onResponse: () => setStreamStatus("processing"),
  });

  async function postMessage(
    userInput: string,
    isInternal = false,
    createNewThread = false,
  ) {
    if (!isAuthenticated) {
      toast.error("You must be logged in to use this tool.");
      return;
    }
    const newUserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userInput,
      requestID: crypto.randomUUID(),
      createdAt: new Date(),
      isInternal,
    } as Message;
    setStreamStatus("pending");
    let currentThreadID = currentThread?.id.toString();
    const isOnThread = currentThreadID !== undefined;
    const isThreadOwner = currentThread?.createdBy === session?.user?.id;
    if (createNewThread || !isOnThread) {
      setChatMessages([newUserMessage]);
      // Create a new thread
      currentThreadID = await generateThreadID(serverData.tool.id);
    } else if (!isThreadOwner) {
      // If the user is not the thread owner, create a new thread
      currentThreadID = await generateThreadID(serverData.tool.id);
      await insertMessages(
        serverData.tool.id.toString(),
        currentThreadID,
        chatMessages,
      );
    } else {
      setChatMessages([...chatMessages, newUserMessage]);
    }
    let attachedFilePath: string | null = null;
    setInput("");
    setUserUploadedFile(null);
    if (userUploadedFile) {
      attachedFilePath = await uploadFile({ file: userUploadedFile });
    }
    await reload({
      options: {
        body: {
          toolID: serverData.tool.id,
          threadID: currentThreadID,
          newAttachedFilePath: attachedFilePath ?? null,
        },
      },
    });
    navigate(`/tools/${serverData.tool.id}/threads/${currentThreadID}`, {
      preventScrollReset: true,
    });
    revalidator.revalidate();
  }

  async function onSubmit() {
    captureEvent("send-message", { toolID: tool.id });
    postMessage(input);
  }

  const onClickGenerate = async (fieldResponses: Record<string, string>) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to use this tool.");
      return;
    }
    setChatMessages([]);
    captureEvent("click-generate", { toolID: tool.id });
    postMessage(buildUserMessageFromFields(fieldResponses), true, true);
  };

  const onSaveTool = () => {
    if (searchParameters.has("editMode")) {
      searchParameters.delete("editMode");
      setSearchParameters(searchParameters);
    }
    captureEvent("click-save", { toolID: tool.id });
    setIsEditing(false);
  };

  const onClickRestart = () => {
    navigate(`/tools/${tool.id}`);
    revalidator.revalidate();
    setChatMessages([]);
  };

  const onCancel = () => {
    stop();
    setStreamStatus("idle");
  };

  const isThreadInProgress = chatMessages.length > 0;
  const toolHasFields = tool.fields.length > 0;
  const isFileUploadEnabled = tool.allowFileUpload;
  const showInputField =
    isThreadInProgress || (!toolHasFields && !isFileUploadEnabled);

  return (
    <Box width={"100%"} height={"100%"}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={theme.spacing(2)}
        width={"100%"}
        height={"100%"}
        overflow="scroll"
        margin="0 auto"
        sx={{
          overflowX: "hidden",
        }}
        padding={{
          xs: "16px",
          sm: "24px",
          md: "32px",
          lg: "40px",
        }}
        pb={"0 !important"}
      >
        <Box
          display="flex"
          flexDirection="column"
          gap={theme.spacing(3)}
          flex="1 1 0%"
          width="100%"
          margin="0 auto"
          maxWidth={TOOL_MAX_WIDTH}
        >
          <Box>
            {isEditing && <ToolEditor onFinishEditing={onSaveTool} />}
            {!isEditing && (
              <ToolDisplay
                integrationID={tool.integration?.id ?? null}
                integrationFields={
                  tool.integration?.parameters?.map((parameter) => ({
                    label: parameter,
                    value: "",
                    field_type: "short_text",
                    integration_key: parameter,
                  })) ?? []
                }
                setFile={setUserUploadedFile}
                isStreaming={isLoading}
                isEditing={isEditing}
                onClickCancel={onCancel}
                onClickRestart={onClickRestart}
                onClickEdit={() => {
                  captureEvent("click-edit", { toolID: tool.id });
                  setIsEditing(true);
                }}
                onClickGenerate={onClickGenerate}
                threadID={threadID}
              />
            )}
          </Box>
          {chatMessages.length === 0 ? (
            <PrivacyDisclaimer />
          ) : (
            <Messages
              messages={chatMessages}
              messageRatings={messageRatings}
              messageLoading={streamStatus === "pending"}
              isStreaming={isLoading}
              onMessageRatingUpdate={(
                rating: boolean | undefined,
                messageId: string,
              ) => {
                setMessageRatings((prev) => ({
                  ...prev,
                  [messageId]: rating,
                }));
              }}
            />
          )}
        </Box>

        {!isEditing && showInputField && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              width: "100%",
              margin: "0 auto",
              background: theme.palette["indigo-25"],
              paddingBottom: theme.spacing(2),
              maxWidth: TOOL_MAX_WIDTH,
              borderRadius: theme.radius.md,
            }}
          >
            <MessageInputField
              onCancel={onCancel}
              onSubmit={onSubmit}
              onChange={handleInputChange}
              input={input}
              streamStatus={streamStatus}
              file={userUploadedFile}
              setFile={setUserUploadedFile}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
