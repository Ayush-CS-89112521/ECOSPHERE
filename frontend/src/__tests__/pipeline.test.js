import { jest } from '@jest/globals';
import { fetchJson } from '../lib/aqi/http.js';
import service, { getDelhiAirQuality } from '../lib/aqi/service.js';
import { fetchHourlyWeather } from '../lib/aqi/weather.js';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; service._cache.clear(); });
test.each([401, 429, 500])('upstream HTTP %p yields labelled synthetic fallback through snapshot', async status => {
  globalThis.fetch = jest.fn(async () => ({ ok: false, status }));
  const result = await getDelhiAirQuality();
  expect(result.meta.source).toBe('fallback');
  expect(result.meta.isLive).toBe(false);
  expect(result.meta.latestObservationAt).toBeNull();
  expect(result.meta.retrievedAt).toBeTruthy();
  expect(result.meta.status).toBe('fallback');
  expect(result.stations).toHaveLength(6);
  expect(result.stations.every(s => s.isFallback)).toBe(true);
  expect((await getDelhiAirQuality()).meta.cache.hit).toBe(true);
});
test('malformed upstream results trigger fallback', async () => {
  globalThis.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ results: null }) }));
  expect((await getDelhiAirQuality()).meta.source).toBe('fallback');
});
test('HTTP client cancels timed-out requests', async () => {
  jest.useFakeTimers();
  try {
    globalThis.fetch = jest.fn((_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))));
    const pending = expect(fetchJson('https://example.test')).rejects.toThrow('aborted');
    await jest.advanceTimersByTimeAsync(4001);
    await pending;
  } finally { jest.useRealTimers(); }
});
test('weather uses absolute UTC instants so IST does not depend on host timezone', async () => {
  globalThis.fetch = jest.fn(async url => {
    expect(new URL(url).searchParams.get('timeformat')).toBe('unixtime');
    return { ok: true, json: async () => ({ hourly: { time: [1767225600], wind_speed_10m: [4], boundary_layer_height: [500] } }) };
  });
  expect((await fetchHourlyWeather()).hourly[0].time).toBe('2026-01-01T00:00:00.000Z');
});
