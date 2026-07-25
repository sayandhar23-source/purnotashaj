'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type CategoryNode = {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
};

// Returns the path of category ids from `node` down to the active slug (inclusive),
// or null if the active slug isn't found anywhere in this subtree — used so the
// branches leading to whatever category is currently open start expanded.
function findExpandedPath(node: CategoryNode, activeSlug: string, path: string[] = []): string[] | null {
  const nextPath = [...path, node._id];
  if (node.slug === activeSlug) return nextPath;
  for (const child of node.children || []) {
    const found = findExpandedPath(child, activeSlug, nextPath);
    if (found) return found;
  }
  return null;
}

function TreeNode({
  node,
  depth,
  activeSlug,
  expandedIds,
  toggle,
}: {
  node: CategoryNode;
  depth: number;
  activeSlug: string;
  expandedIds: Set<string>;
  toggle: (id: string) => void;
}) {
  const hasChildren = (node.children?.length || 0) > 0;
  const isExpanded = expandedIds.has(node._id);
  const isActive = node.slug === activeSlug;

  return (
    <div>
      <div
        className={`flex items-center rounded-lg ${isActive ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
        style={{ paddingLeft: depth * 14 }}
      >
        <Link
          href={`/category/${node.slug}`}
          className={`flex-1 min-w-0 px-3 py-2 text-sm truncate ${
            isActive ? 'text-brand-600 font-medium' : 'text-gray-700'
          }`}
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            onClick={() => toggle(node._id)}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="p-2 text-gray-400 hover:text-brand-500 shrink-0"
          >
            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              activeSlug={activeSlug}
              expandedIds={expandedIds}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategorySidebarTree({
  root,
  activeSlug,
}: {
  root: CategoryNode;
  activeSlug: string;
}) {
  const initialPath = findExpandedPath(root, activeSlug) || [root._id];
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(initialPath));

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="border border-gray-100 rounded-xl p-2">
      <TreeNode node={root} depth={0} activeSlug={activeSlug} expandedIds={expandedIds} toggle={toggle} />
    </div>
  );
}
