import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto">
      <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
        {all.map((crumb, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="text-gray-300 shrink-0" />}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="hover:text-brand-500">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-700 font-medium' : ''}>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
