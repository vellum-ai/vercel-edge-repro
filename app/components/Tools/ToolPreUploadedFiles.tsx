import { Box } from "@mui/joy";
import { useTool } from "../../hooks/useTool";
import { UploadedFile } from "../FileUpload/UploadedFile";

export function ToolPreUploadedFiles() {
  const tool = useTool();
  return (
    <Box>
      {tool.documents.map((doc, i) => {
        if (!doc) return null;
        return <UploadedFile key={`${doc.name}-${i}`} doc={doc} />;
      })}
    </Box>
  );
}
