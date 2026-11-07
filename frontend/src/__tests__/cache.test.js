import { TTLCache } from '../lib/aqi/cache.js';

describe('TTLCache', () => {
  let cache;

  beforeEach(() => {
    cache = new TTLCache();
  });

  it('handles cache miss correctly', () => {
    const entry = cache.get('nonexistent');
    expect(entry).toBeNull();
  });

  it('handles cache hit correctly', () => {
    cache.set('city', 'Delhi', 5000);
    const entry = cache.get('city');
    expect(entry).not.toBeNull();
    expect(entry.value).toBe('Delhi');
    expect(entry.isExpired).toBe(false);
  });

  it('handles TTL expiration', async () => {
    cache.set('temp', 25, 50); // 50ms TTL
    expect(cache.get('temp')?.value).toBe(25);

    await new Promise((r) => setTimeout(r, 70));
    expect(cache.get('temp')).toBeNull();
  });

  it('supports explicit expire() and clear()', () => {
    cache.set('k1', 'v1', 10000);
    cache.set('k2', 'v2', 10000);

    cache.expire('k1');
    expect(cache.get('k1')).toBeNull();
    expect(cache.get('k2')?.value).toBe('v2');

    cache.clear();
    expect(cache.get('k2')).toBeNull();
  });

  it('loads via getOrLoad on miss and hits on subsequent calls', async () => {
    let loaderCalls = 0;
    const loader = async () => {
      loaderCalls++;
      return { value: { aqi: 310 }, ttlMs: 1000 };
    };

    const first = await cache.getOrLoad('key', loader);
    expect(first.hit).toBe(false);
    expect(first.value.aqi).toBe(310);
    expect(loaderCalls).toBe(1);

    const second = await cache.getOrLoad('key', loader);
    expect(second.hit).toBe(true);
    expect(second.value.aqi).toBe(310);
    expect(loaderCalls).toBe(1);
  });
});
