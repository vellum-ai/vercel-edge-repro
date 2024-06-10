import { Send, Stop } from "@mui/icons-material";
import { Box, IconButton, Input, Textarea, Tooltip, useTheme } from "@mui/joy";
import { Form } from "@remix-run/react";
import { useRef, useState } from "react";
import { AttachedFile } from "../../FileUpload/AttachedFile";
import { FileUploadButton } from "../../FileUpload/FileUploadButton";
import type { StreamStatus } from "../UnifiedTool";

type MessageInputProps = {
  streamStatus: StreamStatus;
  file: File | null;
  setFile: (file: File | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
};

export function MessageInputField({
  streamStatus,
  input,
  onChange,
  onSubmit,
  onCancel,
  setFile,
  file,
}: MessageInputProps) {
  const theme = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const sendDisabled = streamStatus === "idle" && !input && !file;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Form ref={formRef}>
      <Box>
        <Box
          padding={{
            xs: 1,
            sm: 3,
          }}
          bgcolor={theme.palette.background.body}
          border="1px solid"
          borderColor={theme.palette["indigo-50"]}
          borderRadius={theme.radius.md}
          boxShadow={theme.shadow.md}
        >
          {file && (
            <AttachedFile file={file} handleUnsetFile={() => setFile(null)} />
          )}
          <Box
            sx={{
              width: "100%",
              background: theme.palette["gray-25"],
              border: `1px solid ${theme.palette["gray-200"]}`,
              borderRadius: theme.radius.md,
              display: "flex",
              alignItems: "flex-end",
              padding: 1,
            }}
          >
            <Tooltip title="Attach file" placement="top">
              <span
                style={{ bottom: 0, display: "inline-block" }}
                key={file?.name || ""}
              >
                <FileUploadButton
                  setExternalFileState={(file: File | null) => {
                    setFile(file);
                  }}
                />
              </span>
            </Tooltip>
            <Textarea
              placeholder="Send a message"
              onKeyDown={handleKeyDown}
              onChange={onChange}
              value={input}
              maxRows={10}
              sx={{
                "--Textarea-focusedThickness": 0,
                boxShadow: "none",
                border: "none",
                background: "inherit",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: "relative", // Ensure Textarea itself does not interfere with absolute positioning of decorators
              }}
            />
            <Tooltip title="Send message" placement="top">
              <span>
                <IconButton
                  type="button"
                  disabled={sendDisabled}
                  onClick={
                    streamStatus === "pending" || streamStatus === "processing"
                      ? onCancel
                      : onSubmit
                  }
                  sx={{
                    height: "100%",
                    "&:hover": {
                      borderRadius: "4px",
                      backgroundColor: theme.palette["blue-200"],
                    },
                  }}
                >
                  {streamStatus === "pending" ||
                  streamStatus === "processing" ? (
                    <Stop />
                  ) : (
                    <Send
                      sx={{
                        color: sendDisabled
                          ? "inherit"
                          : theme.palette["blue-550"],
                      }}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Form>
  );
}
