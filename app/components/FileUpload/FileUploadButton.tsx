import { AttachFile } from "@mui/icons-material";
import { IconButton, useTheme } from "@mui/joy";
import React from "react";
import { acceptedMimeTypes } from "./supportedTypes";

type FileUploadButtonProps = {
  // set setExternalFile prop so that state can be managed externally
  setExternalFileState: (file: File | null) => void;
};

export function FileUploadButton({
  setExternalFileState,
}: FileUploadButtonProps) {
  const theme = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExternalFileState(event.target.files?.[0] ?? null);
  };

  return (
    <>
      <IconButton onClick={handleIconClick}>
        <AttachFile
          sx={{
            color: theme.palette["blue-550"],
          }}
        />
      </IconButton>
      <input
        ref={fileInputRef}
        name="userFile"
        type="file"
        onChange={handleFileChange}
        multiple={false}
        accept={acceptedMimeTypes}
        style={{
          visibility: "hidden",
          width: 0,
          height: 0,
        }}
      />
    </>
  );
}
