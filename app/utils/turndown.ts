import Turndown from "@joplin/turndown";
import TurndownPluginGFM from "@joplin/turndown-plugin-gfm";

const turndownService = new Turndown();
turndownService.use(TurndownPluginGFM.gfm);

turndownService.addRule("sublist", {
  filter: "ol",
  replacement: (_, node) => {
    return olToGfmMarkdown(node as HTMLElement);
  },
});

function olToGfmMarkdown(olNode: HTMLElement): string {
  function processList(olNode: HTMLElement, level: number): string {
    let markdown = "";
    const items = olNode.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLElement;
      if (item.tagName.toLowerCase() === "li") {
        const prefix = getPrefix(level, i);
        const indent = " ".repeat(level * 2);
        markdown += `${indent}${prefix} `;

        const childNodes = Array.from(item.childNodes);
        for (let j = 0; j < childNodes.length; j++) {
          const childNode = childNodes[j] as HTMLElement;
          const text = childNode.textContent?.trim() ?? "";
          if (childNode.tagName && childNode.tagName.toLowerCase() === "ol") {
            // We need to go deeper!
            markdown += `\n${processList(childNode as HTMLElement, level + 1)}`;
          } else {
            markdown += j === childNodes.length - 1 ? text : `${text} `;
          }
        }
        markdown += "\n";
      }
    }
    return markdown;
  }

  return processList(olNode, 0);
}

function getPrefix(level: number, index: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const romanNumerals = [
    "i",
    "ii",
    "iii",
    "iv",
    "v",
    "vi",
    "vii",
    "viii",
    "ix",
    "x",
    "xi",
    "xii",
    "xiii",
    "xiv",
    "xv",
    "xvi",
    "xvii",
    "xviii",
    "xix",
    "xx",
  ];

  switch (level) {
    case 0:
      return `${index + 1}.`; // Top level: 1., 2., 3., ...
    case 1:
      return `${alphabet[index]}.`; // Second level: a., b., c., ...
    case 2:
      return `${romanNumerals[index]}.`; // Third level: i., ii., iii., ...
    default:
      return `${index + 1}.`; // Default to numeric for deeper levels
  }
}

export const turndown = (content: string): string => {
  return turndownService.turndown(content);
};
