/*
 * Given a markdown string, copy the rendered HTML to the clipboard
 * This allows users to then paste the contents to a rich text editor, like Google Docs
 */

import { marked } from "marked";
import toast from "react-hot-toast";

export async function copyMarkdownToClipboard(content: string) {
  const renderedMarkdownContent = await marked(content);
  const htmlBlob = new Blob([renderedMarkdownContent], { type: "text/html" });
  const plainTextBlob = new Blob([content], { type: "text/plain" });
  const data = [
    new ClipboardItem({
      [htmlBlob.type]: htmlBlob,
      [plainTextBlob.type]: plainTextBlob,
    }),
  ];
  try {
    await navigator.clipboard.write(data);
    toast.success("Copied generated content");
  } catch (e) {
    toast.error("Failed to copy generated content");
  }
}
