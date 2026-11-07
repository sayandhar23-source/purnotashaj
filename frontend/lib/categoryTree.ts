// Recursively search a category tree (as returned by GET /categories) for a
// node matching `slug`, tracking the chain of ancestors along the way.
export function findNodeWithAncestors(
  nodes: any[],
  slug: string,
  ancestors: any[] = [],
): { node: any; ancestors: any[] } | null {
  for (const node of nodes) {
    if (node.slug === slug) return { node, ancestors };
    if (node.children?.length) {
      const found = findNodeWithAncestors(node.children, slug, [...ancestors, node]);
      if (found) return found;
    }
  }
  return null;
}

// Collect a category node's id plus every descendant id, recursively — so a
// top-level category includes products filed under any of its subcategories.
export function collectIds(node: any): string[] {
  const ids = [node._id];
  for (const child of node.children || []) {
    ids.push(...collectIds(child));
  }
  return ids;
}
