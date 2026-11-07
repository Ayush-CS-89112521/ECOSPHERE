import { jest } from '@jest/globals';
import { TTLCache } from '../lib/aqi/cache.js';
import { transformApiResponse } from '../lib/dashboard-data.js';
import { pollutantSubIndex, aqiCategory } from '../lib/aqi/aqi.js';
import { getFallbackStations } from '../lib/aqi/fallback.js';

test.each([Infinity, -Infinity, NaN, '45', {}, -1])('rejects invalid concentration %p', (n) => {
  expect(pollutantSubIndex('pm25', n)).toBeNull();
});
test.each([NaN, Infinity, -1, undefined])('invalid AQI category is unknown: %p', (n) => {
  expect(aqiCategory(n).name).toBe('Unknown');
});
test('decimal boundary never extrapolates below the next index band', () => {
  expect(pollutantSubIndex('pm25', 60.1)).toBe(101);
  expect(pollutantSubIndex('pm10', 100.1)).toBe(101);
});
test('concurrent cache misses share one refresh and rejection can be retried', async () => {
  const cache = new TTLCache();
  const load = jest.fn(async () => ({ value: 42, ttlMs: 1000 }));
  const results = await Promise.all([cache.getOrLoad('key', load), cache.getOrLoad('key', load)]);
  expect(load).toHaveBeenCalledTimes(1);
  expect(results.map(r => r.value)).toEqual([42, 42]);
  await expect(cache.getOrLoad('bad', async () => { throw new Error('upstream'); })).rejects.toThrow('upstream');
  await expect(cache.getOrLoad('bad', load)).resolves.toHaveProperty('value', 42);
});
test('fallback never manufactures observation timestamps', () => {
  expect(getFallbackStations().every(s => s.observedAt === null && s.source === 'synthetic-reference')).toBe(true);
});
test.each([null, {}, { meta: {}, city: {}, stations: null }])('rejects malformed top-level payload %p', (payload) => {
  expect(() => transformApiResponse(payload)).toThrow('Invalid telemetry');
});
test('malformed station values do not become plausible measurements', () => {
  const data = transformApiResponse({ meta: { source: 'fallback' }, city: {}, stations: [null, { name: 'Test', aqi: '400', pm25: Infinity }] });
  expect(data.aqi).toBeNull();
  expect(data.pm25).toBeNull();
  expect(data.stations).toHaveLength(1);
  expect(data.stations[0].aqi).toBeNull();
  expect(data.stations[0].pm25).toBeNull();
  expect(data.restrictions).toEqual([]);
  expect(data.safeWindow.timeRange).toBe('Unavailable');
});
test('successful fallback response stays explicitly synthetic', () => {
  const data = transformApiResponse({ meta: { source: 'fallback', isLive: true, generatedAt: new Date().toISOString() }, city: { aqi: 320 }, stations: [] });
  expect(data.isLive).toBe(false);
  expect(data.dataSource).toContain('Synthetic');
  expect(data.lastUpdated).toBe('No observation timestamp');
  expect(data.grapStatus).not.toContain('Active');
  expect(data.safeToRunNow).toBeNull();
});
test('cached OpenAQ retains observation time instead of generation time', () => {
  const data = transformApiResponse({ meta: { source: 'openaq', isLive: true, stale: false, cache: { hit: true }, latestObservationAt: '2026-01-01T00:00:00Z', generatedAt: '2026-11-07T00:00:00Z' }, city: { aqi: 0 }, stations: [] });
  expect(data.aqi).toBe(0);
  expect(data.dataSource).toContain('cached');
  expect(data.lastUpdated).toContain('2026');
  expect(data.lastUpdated).not.toContain('7/11');
});
