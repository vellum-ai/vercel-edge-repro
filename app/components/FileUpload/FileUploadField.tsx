import { CloudUpload, WarningAmberOutlined } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  Typography,
  useTheme,
} from "@mui/joy";
import { useCallback, useState } from "react";
import { AttachedFile } from "./AttachedFile";
import { acceptedMimeTypes } from "./supportedTypes";

type FileUploadFieldProps = {
  // set setExternalFile prop so that state can be managed externally
  file: File | null;
  setFile: (file: File | null) => void;
  disabled?: boolean;
};

export function FileUploadField({
  file,
  setFile,
  disabled,
}: FileUploadFieldProps) {
  const theme = useTheme();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const validateFile = (file: File) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (!acceptedMimeTypes.includes(file.type)) {
      setErrorMsg(
        "File upload failed because of invalid file type. Please upload a .pdf, .doc, or .docx.",
      );
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        "File upload failed because of file size. Max file size is 50MB.",
      );
      return false;
    }
    return true;
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files ? event.target.files[0] : null;
    if (newFile && validateFile(newFile)) {
      setFile(newFile);
      setErrorMsg("");
    }
  };
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        setFile(file);
        event.dataTransfer.clearData();
      }
    },
    [setFile],
  );

  return (
    <>
      <FormControl sx={{ width: "100%" }} error>
        <Box
          sx={{
            padding: theme.spacing(2),
            background: disabled
              ? theme.palette["gray-100"]
              : theme.palette["blue-25"],
            borderRadius: theme.spacing(1),
            borderWidth: "2px",
            borderStyle: "dashed",
            borderColor: theme.palette["gray-400"],
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <Typography
              sx={{
                display: "flex",
                fontFamily: "Open Sans",
                color: disabled ? theme.palette["gray-400"] : "inherit",
              }}
            >
              {" "}
              <CloudUpload
                sx={{
                  fill: disabled ? theme.palette["gray-500"] : "#1298B6",
                  marginX: "20px",
                }}
              />{" "}
              Drop files to attach or
              <Typography
                sx={{
                  color: theme.palette["blue-600"],
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <label
                  style={{
                    color: disabled
                      ? theme.palette["gray-500"]
                      : theme.palette["blue-600"],
                    fontWeight: "700",
                    cursor: disabled ? "default" : "pointer",
                  }}
                >
                  &nbsp;browse
                  <input
                    name="userFile"
                    disabled={disabled}
                    type="file"
                    onChange={handleFileChange}
                    multiple={false}
                    accept={acceptedMimeTypes}
                    style={{
                      clip: "rect(0 0 0 0)",
                      clipPath: "inset(50 %)",
                      height: "1px",
                      overflow: "hidden",
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      whiteSpace: "nowrap",
                      width: "1px",
                    }}
                  />
                </label>
              </Typography>
            </Typography>
          ) : (
            <AttachedFile file={file} handleUnsetFile={() => setFile(null)} />
          )}
        </Box>

        {errorMsg !== "" ? (
          <FormHelperText color="danger">
            <WarningAmberOutlined />
            {errorMsg}
          </FormHelperText>
        ) : null}
      </FormControl>
    </>
  );
}
