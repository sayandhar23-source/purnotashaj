// A tiny in-process cache for data that is read on nearly every page view but
// changes rarely (category tree, store settings). This backend runs as a single
// instance, so in-memory is correct here, and writes explicitly clear the keys
// they affect so admin edits still show up immediately.
type Entry = { value: unknown; expires: number };

class TtlCache {
  private store = new Map<string, Entry>();

  async wrap<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;
    const value = await loader();
    this.store.set(key, { value, expires: Date.now() + ttlMs });
    return value;
  }

  del(...keys: string[]) {
    keys.forEach((k) => this.store.delete(k));
  }
}

export const appCache = new TtlCache();
export const CACHE_KEYS = {
  categoriesWithProducts: 'categories:withProducts',
  categoriesAll: 'categories:all',
  settings: 'settings:doc',
};
