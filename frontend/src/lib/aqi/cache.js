export class TTLCache {
  constructor() {
    this._map = new Map();
    this._pending = new Map();
  }

  get(key) {
    const entry = this._map.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (entry.expiresAt && now >= entry.expiresAt) {
      this._map.delete(key);
      return null;
    }
    return {
      value: entry.value,
      ageMs: now - entry.cachedAt,
      ttlMs: entry.expiresAt ? entry.expiresAt - entry.cachedAt : Infinity,
      isExpired: false,
    };
  }

  set(key, value, ttlMs) {
    const now = Date.now();
    this._map.set(key, {
      value,
      cachedAt: now,
      expiresAt: ttlMs ? now + ttlMs : null,
    });
  }

  expire(key) {
    const entry = this._map.get(key);
    if (entry) entry.expiresAt = Date.now() - 1;
  }

  clear() {
    this._map.clear();
  }

  async getOrLoad(key, loader) {
    const existing = this.get(key);
    if (existing) {
      return { value: existing.value, hit: true, ageMs: existing.ageMs, ttlMs: existing.ttlMs };
    }
    if (this._pending.has(key)) return this._pending.get(key);
    const pending = Promise.resolve().then(loader).then(({ value, ttlMs }) => {
      this.set(key, value, ttlMs);
      return { value, hit: false, ageMs: 0, ttlMs: ttlMs || 0 };
    }).finally(() => this._pending.delete(key));
    this._pending.set(key, pending);
    return pending;
  }
}

export default { TTLCache };
