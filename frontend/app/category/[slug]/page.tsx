import Link from 'next/link';
import ProductCard, { ProductSummary } from '@/components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function safeJson(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getCategoryTree() {
  const data = await safeJson(`${API}/categories`);
  return data || [];
}

async function getProductsByCategoryIds(ids: string[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];
  const data = await safeJson(`${API}/products?categories=${ids.join(',')}&limit=60`);
  return data?.products || [];
}

async function getFeatured(): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products?featured=true&limit=8`);
  return data?.products || [];
}

// Recursively search the category tree for a node matching `slug`, tracking the
// chain of ancestors along the way (used for the "back to parent" link).
function findNodeWithAncestors(
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

// Collect this node's id plus every descendant id, recursively — so a top-level
// category page includes products filed under any of its subcategories.
function collectIds(node: any): string[] {
  const ids = [node._id];
  for (const child of node.children || []) {
    ids.push(...collectIds(child));
  }
  return ids;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const tree = await getCategoryTree();
  const found = findNodeWithAncestors(tree, params.slug);
  const category = found?.node;
  const parent = found?.ancestors?.[found.ancestors.length - 1];
  const ownChildren: any[] = category?.children || [];
  const siblings: any[] = parent?.children || [];

  // If this category has its own subcategories, show those in the filter sidebar.
  // Otherwise (a leaf / subcategory page), fall back to showing its siblings, so the
  // filter stays visible and usable even when browsing a subcategory directly.
  const sidebarRoot = ownChildren.length > 0 ? category : parent;
  const sidebarItems = ownChildren.length > 0 ? ownChildren : siblings;
  const showSidebar = !!sidebarRoot && sidebarItems.length > 0;

  const categoryIds = category ? collectIds(category) : [];
  const products = await getProductsByCategoryIds(categoryIds);
  const suggestions = products.length === 0 ? await getFeatured() : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {parent && (
        <Link href={`/category/${parent.slug}`} className="text-sm text-brand-500 mb-2 inline-block">
          ← All in {parent.name}
        </Link>
      )}
      <h1 className="text-2xl font-serif font-semibold mb-2 capitalize">
        {category?.name || params.slug.replace(/-/g, ' ')}
      </h1>
      {category?.description && <p className="text-gray-500 mb-6">{category.description}</p>}

      <div className={showSidebar ? 'md:grid md:grid-cols-[200px_1fr] md:gap-8' : ''}>
        {showSidebar && (
          <aside className="md:sticky md:top-20 md:h-fit mb-6 md:mb-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Filter by
            </p>
            {/* Horizontal scroll on mobile, vertical list on desktop */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <Link
                href={`/category/${sidebarRoot.slug}`}
                className={`shrink-0 min-w-fit px-4 py-2 rounded-full md:rounded-lg border text-sm font-medium whitespace-nowrap ${
                  category?.slug === sidebarRoot.slug
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-gray-300 text-gray-600 hover:border-brand-400'
                }`}
              >
                All {sidebarRoot.name}
              </Link>
              {sidebarItems.map((sub: any) => (
                <Link
                  key={sub._id}
                  href={`/category/${sub.slug}`}
                  className={`shrink-0 min-w-fit px-4 py-2 rounded-full md:rounded-lg border text-sm whitespace-nowrap ${
                    category?.slug === sub.slug
                      ? 'border-brand-500 bg-brand-50 text-brand-600 font-medium'
                      : 'border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </aside>
        )}

        <div className="min-w-0">
          {products.length === 0 ? (
            <div>
              <p className="text-gray-500 text-sm mb-8">
                {category
                  ? "No products in this category yet — here's what's popular right now."
                  : "We couldn't find that category — here's what's popular right now."}
              </p>
              {suggestions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {suggestions.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
