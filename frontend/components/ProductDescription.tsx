import { parseDescription } from '@/lib/parseDescription';

export default function ProductDescription({ text }: { text: string }) {
  const blocks = parseDescription(text);

  return (
    <div className="mt-8 text-sm text-gray-600 leading-relaxed space-y-3">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <p key={i} className="font-semibold text-gray-800 pt-2">
              {block.text}
            </p>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}
