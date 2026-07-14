'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard, { ProductSummary } from '@/components/ProductCard';

function SearchInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search: q, limit: 40 } });
      setProducts(res.data.products || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mb-8 max-w-md"
      >
        <input
          className="input"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {loading ? (
        <p className="text-gray-400 text-sm">Searching...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-sm">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchInner;
