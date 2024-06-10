import { Close, InsertDriveFile } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/joy";

function formatFileSize(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

type AttachedFileProps = {
  // set setExternalFile prop so that state can be managed externally
  file: File;
  handleUnsetFile?: () => void;
};

export function AttachedFile({ file, handleUnsetFile }: AttachedFileProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: "12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
        }}
      >
        <InsertDriveFile sx={{ fill: theme.palette["blue-550"] }} />

        <Typography
          sx={{
            display: "inline-block",
            fontFamily: "Open Sans",
            color: theme.palette["blue-550"],
            fontSize: "14px",
            fontWeight: 400,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          {file.name}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Open Sans",
            color: theme.palette["gray-400"],
            fontSize: "14px",
            fontWeight: 400,
            flexShrink: 0,
          }}
        >
          ({formatFileSize(file.size)})
        </Typography>
        {handleUnsetFile && (
          <IconButton
            sx={{ justifySelf: "end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnsetFile();
            }}
          >
            <Close />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
