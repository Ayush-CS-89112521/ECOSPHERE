import cfg from './config.js';
import { TTLCache } from './cache.js';
import { fetchLiveStations } from './openaq.js';
import { fetchHourlyWeather } from './weather.js';
import { getFallbackStations } from './fallback.js';
import { calculateDelhiAdvisories } from './advisories.js';

const cache = new TTLCache();
const SNAPSHOT_KEY = 'delhi-snapshot';

async function loadSnapshot() {
  const [airResult, weatherResult] = await Promise.allSettled([fetchLiveStations(), fetchHourlyWeather()]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

  if (airResult.status === 'fulfilled') {
    return {
      value: { stations: airResult.value, weather, source: 'openaq', retrievedAt: new Date().toISOString(), error: null },
      ttlMs: cfg.CACHE_TTL_MS,
    };
  }

  return {
    value: {
      stations: getFallbackStations(),
      weather,
      source: 'fallback',
      retrievedAt: new Date().toISOString(),
      error: airResult.reason ? airResult.reason.message : 'Unknown air-quality error',
    },
    ttlMs: cfg.FALLBACK_TTL_MS,
  };
}

export async function getDelhiAirQuality() {
  const { value: snapshot, hit, ageMs, ttlMs } = await cache.getOrLoad(SNAPSHOT_KEY, loadSnapshot);

  const weatherMap = new Map();
  if (snapshot.weather && Array.isArray(snapshot.weather.hourly)) {
    for (const h of snapshot.weather.hourly) {
      const ms = Date.parse(h.time);
      if (Number.isFinite(ms)) weatherMap.set(ms, { windKmh: h.windKmh, blhM: h.blhMeters });
    }
  }

  const advisories = calculateDelhiAdvisories({
    stations: snapshot.stations,
    weather: weatherMap.size ? weatherMap : null,
  });

  const latestObs = snapshot.stations
    .map((s) => (s.observedAt ? Date.parse(s.observedAt) : 0))
    .reduce((max, t) => Math.max(max, t), 0);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      timezone: cfg.TZ_NAME,
      source: snapshot.source,
      isLive: snapshot.source === 'openaq',
      stale: snapshot.source !== 'openaq' || !latestObs || Date.now() - latestObs > cfg.MAX_READING_AGE_MS,
      retrievedAt: snapshot.retrievedAt,
      status: snapshot.source === 'fallback' ? 'fallback' : hit ? 'cached' : 'live',
      freshness: snapshot.source === 'fallback' ? 'not-applicable' : Date.now() - latestObs > cfg.MAX_READING_AGE_MS ? 'stale' : 'fresh', 
      fallbackReason: snapshot.error,
      weatherAvailable: weatherMap.size > 0,
      latestObservationAt: latestObs ? new Date(latestObs).toISOString() : null,
      cache: { hit, ageSeconds: Math.round(ageMs / 1000), ttlSeconds: Math.round(ttlMs / 1000) },
      aqiBasis: 'CPCB PM sub-indices only; indicative, not an official AQI (fewer than three pollutants; not a 24-hour average)',
      disclaimer:
        'Fallback values are synthetic examples, not observations. GRAP stage shown is indicative. The official stage is declared by CAQM. ' +
        'Safe-hours are a heuristic estimate; not medical advice.',
    },
    ...advisories,
  };
}

export default { getDelhiAirQuality, _cache: cache };
