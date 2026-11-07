import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { compositeAqi } from '../frontend/src/lib/aqi/aqi.js';
import { fetchHourlyWeather } from '../frontend/src/lib/aqi/weather.js';
const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3100';
const results = [];
for (const path of ['/api/delhi/air-quality', '/api/air-quality']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const data = await response.json();
  assert.ok(['openaq', 'fallback'].includes(data.meta.source));
  assert.ok(data.stations.length > 0);
  const mean = field => { const values = data.stations.map(s => s[field]).filter(Number.isFinite); return values.length ? values.reduce((a,b) => a+b, 0) / values.length : null; };
  assert.equal(data.city.aqi, compositeAqi({ pm25: mean('pm25'), pm10: mean('pm10') }).aqi);
  if (data.meta.source === 'fallback') {
    assert.equal(data.meta.isLive, false);
    assert.equal(data.meta.latestObservationAt, null);
  }
  results.push({ path, status: response.status, data });
}
for (const path of ['/earth/day.jpg', '/earth/night.jpg', '/earth/specularClouds.jpg', '/', '/dashboard', '/worlds', '/achievements', '/sign-in', '/sign-up']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200);
  results.push({ path, status: response.status, bytes: (await response.arrayBuffer()).byteLength });
}
const weather = await fetchHourlyWeather();
results.push({ weather: weather ? { hours: weather.hourly.length, firstInstant: weather.hourly[0]?.time } : null });
await writeFile(new URL('./runtime-results.json', import.meta.url), JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results.map(r => r.data ? { path:r.path, source:r.data.meta.source, aqi:r.data.city.aqi, stations:r.data.stations.length, observedAt:r.data.meta.latestObservationAt, weatherAvailable:r.data.meta.weatherAvailable } : r), null, 2));
