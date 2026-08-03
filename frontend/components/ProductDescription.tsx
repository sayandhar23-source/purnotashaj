import { parseDescription, parseInline } from '@/lib/parseDescription';

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) =>
        part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>,
      )}
    </>
  );
}

export default function ProductDescription({ text }: { text: string }) {
  const blocks = parseDescription(text);

  return (
    <div className="mt-8 text-sm text-gray-600 leading-relaxed space-y-3">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <p key={i} className="font-semibold text-gray-800 pt-2">
              <Inline text={block.text} />
            </p>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
