const TTL_MS = 30_000;
const store = new Map<string, { value: unknown; expires: number }>();

const cache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },
  set(key: string, value: unknown): void {
    store.set(key, { value, expires: Date.now() + TTL_MS });
  },
  flushAll(): void {
    store.clear();
  },
};

export default cache;

// ponytail: minimal self-check for the expiry branch — `npx ts-node src/utils/cache.ts`
if (require.main === module) {
  cache.set('k', 'v');
  console.assert(cache.get('k') === 'v', 'fresh value should be readable');
  store.set('k', { value: 'v', expires: Date.now() - 1 });
  console.assert(cache.get('k') === undefined, 'expired value should be evicted');
  console.log('cache self-check passed');
}
