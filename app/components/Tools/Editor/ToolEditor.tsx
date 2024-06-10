import { InfoOutlined, Save, WarningAmberOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Switch,
  Textarea,
  type Theme,
  Tooltip,
  Typography,
  switchClasses,
  useTheme,
} from "@mui/joy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTool } from "../../../hooks/useTool.ts";
import { baseTextStyles } from "../../../styles/baseTextStyles.ts";
import { type FullTool, saveToolAndFields } from "../../../utils/api/tools.ts";
import { ToolFormBox } from "../presentational/ToolFormBox.tsx";
import { ToolFormLabel } from "../presentational/ToolFormLabel.tsx";
import { ToolFormSectionHeader } from "../presentational/ToolFormSectionHeader.tsx";
import { FieldsEditor } from "./FieldsEditor.tsx";

import { PreuploadEditor } from "./PreuploadEditor.tsx";

export const ToolEditor = ({
  onFinishEditing,
}: {
  onFinishEditing: () => void;
}) => {
  const tool = useTool();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(tool.title);
  const [description, setDescription] = useState(tool.description);
  const [conversationStarter, setConversationStarter] = useState(
    tool.conversationStarter,
  );
  const [systemPrompt, setSystemPrompt] = useState(tool.systemPrompt);
  const [fields, setFields] = useState<FullTool["tool_fields"]>(tool.fields);
  const [emptyFields, setEmptyFields] = useState<number[]>([]);
  const [allowAutoStartConversation, setAllowAutoStartConversation] =
    useState<boolean>(!!tool.conversationStarter);
  const [convoStarterError, setConvoStarterError] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<boolean>(false);
  const [integrationID, setIntegrationID] = useState<string | undefined>();
  const [instructionError, setInstructionError] = useState<boolean>(false);
  const [preuploadedDocuments, setPreuploadedDocuments] = useState<
    FullTool["documents"]
  >(tool.documents);
  const [preuploadedFile, setPreuploadedFile] = useState<File | null>(null);
  const toolMutation = useMutation({
    mutationFn: saveToolAndFields,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tool", tool.id],
      });
      onFinishEditing();
    },
    onError: () => {
      toast.error("Failed to save tool");
    },
  });
  const theme = useTheme();

  const onClickSave = async () => {
    const validateFields = () => {
      return fields
        .filter((field) => field.label.trim() === "")
        .map((field) => field.id);
    };
    const isInvalidInput = (input: string) => input.trim() === "";
    const emptyFieldIds = validateFields();
    setEmptyFields(emptyFieldIds);

    const isTitleEmpty = isInvalidInput(title);
    const isSystemPromptEmpty = isInvalidInput(systemPrompt);
    const isConvoStarterEmpty =
      isInvalidInput(conversationStarter) && allowAutoStartConversation;
    const hasEmptyFields = emptyFieldIds.length !== 0;

    if (
      isTitleEmpty ||
      isSystemPromptEmpty ||
      hasEmptyFields ||
      isConvoStarterEmpty
    ) {
      if (isTitleEmpty) setTitleError(isTitleEmpty);
      else setTitleError(false);
      if (isSystemPromptEmpty) setInstructionError(isSystemPromptEmpty);
      else setInstructionError(false);
      if (isConvoStarterEmpty) setConvoStarterError(isConvoStarterEmpty);
      else setConvoStarterError(false);
      return;
    }
    const removedDocument = tool.documents.find(
      (doc: FullTool["documents"][number]) => {
        return !preuploadedDocuments.some((td) => td.id === doc.id);
      },
    );
    toolMutation.mutate({
      toolID: tool.id,
      newTitle: title,
      newDescription: description,
      newSystemPrompt: systemPrompt,
      newFields: fields,
      newPreuploadedFile: preuploadedFile,
      newConversationStarter: conversationStarter,
      removedPreuploadedFile: removedDocument || null,
      integrationID: integrationID || undefined,
    });
  };

  return (
    <ToolFormBox>
      <Box width="100%" gap="20px" display="flex" flexDirection="column">
        <FormControl error={titleError}>
          <Textarea
            sx={{
              background: "white",
              fontSize: "28px",
              fontFamily: "Nunito",
              fontWeight: 600,
              color: "black",
            }}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          {titleError ? (
            <FormHelperText>
              <WarningAmberOutlined />
              Please enter a name.
            </FormHelperText>
          ) : null}
        </FormControl>
        <ToolFormSectionHeader label="Overview" />
        <FormControl sx={{ width: "100%", gap: "8px" }} required>
          <Box display="flex" gap="4px" sx={{ alignItems: "center" }}>
            <ToolFormLabel label="Tool Description" />
            <Tooltip
              title="Tool descriptions are tool summaries. They can describe what the tool is or explain how to use the tool. Descriptions aren’t used by the AI; they’re just for you or the tool user!"
              sx={{ maxWidth: "320px" }}
            >
              <InfoOutlined
                sx={{
                  color: theme.palette["gray-500"],
                  width: "16px",
                  height: "16px",
                }}
              />
            </Tooltip>
          </Box>

          <Typography
            sx={{ color: theme.palette["gray-500"], fontSize: "14px" }}
          >
            Tool descriptions are tool summaries and are not used by the AI.
            They’re just for you and anybody using the tool.
          </Typography>
          <Textarea
            sx={{
              width: "100%",
              minHeight: "4rem",
              border: "1px #C3C9CA solid",
            }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="md"
            placeholder="Description of tool or instructions on how to use it"
          />
        </FormControl>
      </Box>

      <FormControl sx={{ width: "100%", gap: "8px" }} error={instructionError}>
        <Box display="flex" gap="4px" sx={{ alignItems: "center" }}>
          <ToolFormLabel label="AI Prompt" />
          <Tooltip
            title="AI prompts are instructions that tell the AI what to do and guide the AI’s generated output or chatbot. For the best output results, be as specific as possible. If you add additional details or upload a file below, make sure you mention how the AI should use them here."
            sx={{ maxWidth: "320px" }}
          >
            <InfoOutlined
              sx={{
                color: theme.palette["gray-500"],
                width: "16px",
                height: "16px",
              }}
            />
          </Tooltip>
        </Box>
        <Typography sx={{ color: theme.palette["gray-500"], fontSize: "14px" }}>
          Tell the AI what to do and what output to generate. Be specific, and
          be sure to mention any additional details or files.
        </Typography>
        <Textarea
          sx={{
            width: "100%",
            minHeight: "4rem",
            color: "black",
            "--Textarea-placeholderColor": theme.palette["gray-700"],
            "&:focus-within": {
              "--Textarea-focusedHighlight": instructionError
                ? theme.palette["danger-500"]
                : "",
            },
          }}
          value={systemPrompt}
          error={instructionError}
          onChange={(e) => setSystemPrompt(e.target.value)}
          size="md"
          placeholder="Tell the AI what you want it to do"
        />

        {instructionError ? (
          <FormHelperText color="danger">
            <WarningAmberOutlined />
            Please provide instructions for the AI.
          </FormHelperText>
        ) : null}
      </FormControl>

      <FormControl sx={{ width: "100%", gap: "8px" }}>
        <ToolFormLabel label="Files for the AI" />
        <Typography sx={{ color: theme.palette["gray-500"], fontSize: "14px" }}>
          These are files that support the instructions you provided to the AI
        </Typography>
        <PreuploadEditor
          preuploadedDocuments={preuploadedDocuments}
          setPreuploadedDocuments={(docs) => setPreuploadedDocuments(docs)}
          preuploadedFile={preuploadedFile}
          setPreuploadedFile={(file) => setPreuploadedFile(file)}
        />
      </FormControl>
      <FormControl>
        <Box display={"flex"} alignItems={"center"} gap={"4px"}>
          <Switch
            sx={(theme: Theme) => ({
              "--Switch-thumbSize": "18px",
              "--Switch-trackWidth": "49px",
              "--Switch-trackHeight": "24px",
              [`&.${switchClasses.checked}`]: {
                "--Switch-trackBackground": theme.palette["blue-500"],
                "&:hover": {
                  "--Switch-trackBackground": theme.palette["blue-500"],
                },
              },
              fontFamily: "Open Sans",
              lineHeight: "20px",
              color: "#020813",
              fontSize: "16px",
              fontWeight: 600,
            })}
            endDecorator="Have AI auto-start conversation"
            checked={allowAutoStartConversation}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAllowAutoStartConversation(event.target.checked);
              if (!event.target.checked) {
                setConversationStarter("");
              }
            }}
          />
          <Tooltip
            title="When “Have the AI auto-start the conversation” is toggled on, the AI will automatically send a message to the user when they open the tool to kickstart a conversation or provide extra guidance. This can be useful if your tool uses more of a traditional chatbot experience and you don’t have additional details."
            sx={{ maxWidth: "320px" }}
          >
            <InfoOutlined
              sx={{
                color: theme.palette["gray-500"],
                width: "16px",
                height: "16px",
              }}
            />
          </Tooltip>
        </Box>
      </FormControl>
      {allowAutoStartConversation ? (
        <FormControl
          sx={{ width: "100%", gap: "8px" }}
          error={convoStarterError}
        >
          <ToolFormLabel label="AI Welcome Message" />
          <Typography
            sx={{ color: theme.palette["gray-500"], fontSize: "14px" }}
          >
            If the AI is auto-starting the conversation, what message should it
            send to kick off the conversation?
          </Typography>
          <Textarea
            sx={{
              width: "100%",
              minHeight: "4rem",
              color: "black",
              "&:focus-within": {
                "--Textarea-focusedHighlight": instructionError
                  ? theme.palette["danger-500"]
                  : "",
              },
            }}
            value={conversationStarter}
            placeholder="Message the AI should send to start the conversation"
            onChange={(e) => setConversationStarter(e.target.value)}
          />
          {convoStarterError ? (
            <FormHelperText color="danger">
              <WarningAmberOutlined />
              Please provide a converstation starter for the AI.
            </FormHelperText>
          ) : null}
        </FormControl>
      ) : null}

      <FieldsEditor
        fields={fields}
        setFields={setFields}
        emptyFields={emptyFields}
        integrationID={integrationID}
        setIntegrationID={setIntegrationID}
      />
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          width: "100%",
          justifyContent: "end",
        }}
      >
        <Button
          variant="outlined"
          onClick={onFinishEditing}
          sx={{
            "&:hover": {
              background: theme.palette["blue-300"],
            },
            "&:active": {
              background: theme.palette["blue-400"],
            },
          }}
        >
          <Typography
            sx={{
              ...baseTextStyles,
              color: theme.palette["blue-700"],
              "&:active": {
                color: theme.palette["blue-800"],
              },
            }}
          >
            CANCEL
          </Typography>
        </Button>

        <Button
          disabled={toolMutation.isPending}
          id="savetool"
          sx={{
            background: theme.palette["blue-500"],
            alignSelf: "end",
            "&:hover": {
              background: theme.palette["blue-600"],
            },
            "&:active": {
              background: theme.palette["blue-700"],
            },
          }}
          onClick={onClickSave}
          startDecorator={
            toolMutation.isPending ? <CircularProgress /> : <Save />
          }
        >
          <Typography
            sx={{
              color: "white",
              ...baseTextStyles,
            }}
          >
            {toolMutation.isPending ? "Saving..." : "SAVE"}
          </Typography>
        </Button>
      </Box>
    </ToolFormBox>
  );
};
