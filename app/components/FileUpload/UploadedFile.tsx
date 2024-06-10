import { Close, InsertDriveFile } from "@mui/icons-material";
import { Box, IconButton, Link, useTheme } from "@mui/joy";
import {
  type FullTool,
  fetchFileStoragePathForDownload,
} from "../../utils/api/tools";

type UploadedFileProps = {
  // set setExternalFile prop so that state can be managed externally
  doc: FullTool["documents"][number];
  handleRemoveDoc?: () => void;
};

export function UploadedFile({ doc, handleRemoveDoc }: UploadedFileProps) {
  const theme = useTheme();

  const handleFileDownload = async () => {
    const fileURL = await fetchFileStoragePathForDownload(
      doc.storage_object_id,
    );
    if (fileURL) {
      window.open(fileURL, "_blank");
    }
  };

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
          width: "90%",
          whiteSpace: "nowrap",
        }}
      >
        <InsertDriveFile sx={{ fill: theme.palette["blue-550"] }} />

        <Link
          onClick={() => handleFileDownload()}
          target="__blank"
          sx={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "Open Sans",
            maxWidth: "10000px",
            verticalAlign: "top",
            color: theme.palette["blue-550"],
            fontSize: "14px",
            fontWeight: 400,
          }}
        >
          {doc.name}
        </Link>
      </Box>
      {handleRemoveDoc && (
        <IconButton
          sx={{ justifySelf: "end" }}
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveDoc();
          }}
        >
          <Close />
        </IconButton>
      )}
    </Box>
  );
}
