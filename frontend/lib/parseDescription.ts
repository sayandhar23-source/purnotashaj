export type DescriptionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

const HEADING_RE = /^#{1,6}\s+(.*)$/;
const LIST_ITEM_RE = /^[*-]\s+(.*)$/;

// A small, forgiving markdown-style parser for product descriptions — no
// blank-line spacing required around headings/lists, matching real-world
// pasted text rather than strict markdown. Recognizes:
//   # / ## / ### Heading      -> bold subheading
//   * item   or   - item      -> bullet list (consecutive lines group together)
//   **bold**                  -> inline bold, anywhere in a heading/paragraph/item
//   a short line with no ending punctuation (no # needed) -> also treated as
//     a heading, so plain text without any markdown symbols still works
export function parseDescription(raw: string): DescriptionBlock[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: DescriptionBlock[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const isShortHeading =
      paragraphBuffer.length === 1 &&
      paragraphBuffer[0].length <= 40 &&
      !/[.!?,;:]$/.test(paragraphBuffer[0]);
    blocks.push(
      isShortHeading
        ? { type: 'heading', text: paragraphBuffer[0] }
        : { type: 'paragraph', text: paragraphBuffer.join(' ') },
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push({ type: 'list', items: listBuffer });
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', text: headingMatch[1].trim() });
      continue;
    }

    const listMatch = line.match(LIST_ITEM_RE);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

// Splits "text **bold** text" into plain strings and { bold: true } segments,
// so the renderer can turn **...** into <strong> without a full markdown lib.
export function parseInline(text: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }
  return parts.length > 0 ? parts : [{ text, bold: false }];
}
