import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { marked } from "marked";
import type { Errorable } from "~/utils/errorable";

type ExportDocumentRequest = {
  title: string;
  content: string;
};

type ExportDocumentResponse = {
  url: string;
};

interface ExportService {
  /**
   * Exports a document to Google Drive
   * @param {ExportDocumentRequest} request - The request object containing the document details
   * @param {string} request.title - The title of the document
   * @param {string} request.content - The content of the document in Markdown format
   * @returns A promise that resolves to an object containing the error (if any) and the exported document URL if successful.
   */
  exportDocument(
    request: ExportDocumentRequest,
  ): Promise<Errorable<ExportDocumentResponse>>;
}

type ExportServiceParams = {
  CLIENT_EMAIL: string;
  PRIVATE_KEY: string;
};

/**
 * newExportService creates a service for exporting documents to Google Drive
 * @param CLIENT_EMAIL: string
 * @param PRIVATE_KEY: string
 */
export const newExportService = ({
  CLIENT_EMAIL,
  PRIVATE_KEY,
}: ExportServiceParams): ExportService => {
  return {
    exportDocument: async (request: ExportDocumentRequest) => {
      try {
        const SCOPES = ["https://www.googleapis.com/auth/drive"];
        const auth = new JWT({
          email: CLIENT_EMAIL,
          key: PRIVATE_KEY,
          scopes: SCOPES,
        });
        const drive = google.drive({ version: "v3", auth });
        const htmlContent = await transformMarkdownToHTML(request.content);
        const res = await drive.files.create({
          requestBody: {
            name: request.title,
            mimeType: "application/vnd.google-apps.document",
          },
          fields: "id",
          media: {
            mimeType: "text/html",
            body: htmlContent,
          },
        });

        const fileId = res.data.id;
        if (!fileId) {
          throw new Error("Failed to create Google Doc");
        }

        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: "reader",
            type: "anyone",
            allowFileDiscovery: false,
          },
        });

        return {
          error: null,
          data: {
            url: `https://docs.google.com/document/d/${res.data.id}/copy`,
          },
        };
      } catch (e) {
        if (e instanceof Error) {
          return { error: e, data: null };
        }
        return {
          error: new Error(
            "an unknown error occured while creating the document",
          ),
          data: null,
        };
      }
    },
  };
};

/**
 * transformMarkdownToHTML converts a markdown string to HTML
 * @param {string} html - The markdown content to convert to HTML
 * @returns A promise that resolves to the HTML content
 */
const transformMarkdownToHTML = async (html: string): Promise<string> => {
  const modifiedContent = html.replace(
    /(?<!\\)(?:\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\])/g,
    (_, inlineEquation, displayEquation) => {
      const equation = inlineEquation || displayEquation;
      const encodedEquation = equation
        .replace(/\n/g, " ") // Replace newline characters with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Trim leading and trailing spaces
      const rawURL = `https://latex.codecogs.com/png.image?\\inline\\dpi{500}\\huge%20${encodedEquation}`;
      return `<img src="${rawURL}" alt="${equation}" height="14px" />`;
    },
  );
  return await marked.parse(modifiedContent);
};
