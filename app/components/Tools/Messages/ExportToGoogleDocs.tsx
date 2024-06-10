import { AddToDrive } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/joy";
import toast from "react-hot-toast";
import type { ExportResponse } from "~/routes/api.export";
import { authenticatedFetch } from "~/utils/authenticated-fetch";

const openDocumentInDrive = async (content: string) => {
  try {
    const res = await toast.promise(
      authenticatedFetch("/api/export", {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to export to Google Docs");
        }
        return res.json() as Promise<ExportResponse>;
      }),
      {
        loading: "Exporting to Google Docs...",
        success: "Exported to Google Docs!",
        error: "Failed to export to Google Docs",
      },
      {
        position: "bottom-center",
      },
    );
    const url = res.url;
    window.open(url, "_blank");
  } catch (e) {
    console.error(e);
  }
};

export function ExportToGoogleDocs({ content }: { content: string }) {
  return (
    <Tooltip title="Export to Google Docs">
      <IconButton onClick={() => openDocumentInDrive(content)}>
        <AddToDrive />
      </IconButton>
    </Tooltip>
  );
}
