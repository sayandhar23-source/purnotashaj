export type DescriptionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

// Turns a plain-text product description (typed or pasted, no markdown
// knowledge required) into structured blocks:
// - blank-line-separated chunks become paragraphs
// - a chunk where every line starts with "*" or "-" becomes a bullet list
// - a short single line with no ending punctuation (e.g. "Product Details")
//   becomes a bold subheading, since that's how admins naturally introduce
//   a details list without needing to learn any special syntax
export function parseDescription(raw: string): DescriptionBlock[] {
  const chunks = raw
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean);

  return chunks.map((chunk): DescriptionBlock => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);

    const isList = lines.length > 0 && lines.every((l) => /^[*-]\s+/.test(l));
    if (isList) {
      return { type: 'list', items: lines.map((l) => l.replace(/^[*-]\s+/, '')) };
    }

    const isShortHeading =
      lines.length === 1 &&
      lines[0].length <= 40 &&
      !/[.!?,;:]$/.test(lines[0]);
    if (isShortHeading) {
      return { type: 'heading', text: lines[0] };
    }

    return { type: 'paragraph', text: lines.join(' ') };
  });
}
