import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";
import MarkdownIt from "markdown-it";
import markdownItTexmath from "markdown-it-texmath";
import "./Markdown.css";

const purify = DOMPurify(window);
function ensureNewlinesForLatexBlocks(markdownText: string) {
  // Regular expression to match display LaTeX blocks, capturing the leading and trailing characters
  const regex = /(^|[^\\])(\\\[.*?\\\])/gs;

  // Replacement function to ensure there are newlines around the LaTeX block
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const replacement = (_match: string, p1: any, p2: any) =>
    `${p1}\n\n${p2}\n\n`;

  // Replace in the original text
  return markdownText.replace(regex, replacement);
}

const md = new MarkdownIt({ html: true }).use(markdownItTexmath, {
  engine: katex,
  delimiters: "brackets", // Choose your preferred delimiters, e.g., 'dollars', 'brackets', etc.
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
});

type CustomMarkdownProps = {
  content: string;
};
export default function CustomMarkdown({ content }: CustomMarkdownProps) {
  const renderedText = md.render(ensureNewlinesForLatexBlocks(content));
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
    <div dangerouslySetInnerHTML={{ __html: purify.sanitize(renderedText) }} />
  );
}
