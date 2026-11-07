import cfg from './config.js';
import { fetchJson } from './http.js';
import { TTLCache } from './cache.js';

const discoveryCache = new TTLCache();

const headers = () => (cfg.OPENAQ_API_KEY ? { 'X-API-Key': cfg.OPENAQ_API_KEY } : {});

function oaqUrl(path, params = {}) {
  const url = new URL(cfg.OPENAQ_BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  return url.toString();
}

export async function discoverStations() {
  const { value } = await discoveryCache.getOrLoad('stations', async () => {
    const data = await fetchJson(
      oaqUrl('/locations', {
        coordinates: `${cfg.DELHI_CENTER.lat},${cfg.DELHI_CENTER.lon}`,
        radius: cfg.SEARCH_RADIUS_M,
        parameters_id: 2,
        limit: 1000,
      }),
      headers()
    );

    const found = [];
    for (const loc of data.results || []) {
      const label = `${loc.name || ''} ${loc.locality || ''}`;
      const target = cfg.TARGET_STATIONS.find((t) => t.match.test(label));
      if (!target) continue;

      const sensorParam = {};
      for (const s of loc.sensors || []) {
        const pname = (s.parameter && s.parameter.name) || '';
        const units = (s.parameter && s.parameter.units) || '';
        if ((pname === 'pm25' || pname === 'pm10') && /µg|ug/i.test(units)) {
          sensorParam[s.id] = pname;
        }
      }
      found.push({
        id: loc.id,
        name: target.label,
        lat: loc.coordinates && loc.coordinates.latitude,
        lon: loc.coordinates && loc.coordinates.longitude,
        sensorParam,
      });
    }
    return { value: found, ttlMs: cfg.STATION_DISCOVERY_TTL_MS };
  });
  return value;
}

async function fetchStationLatest(station) {
  const data = await fetchJson(oaqUrl(`/locations/${station.id}/latest`), headers());
  const out = { pm25: null, pm10: null, observedAt: null };
  const cutoff = Date.now() - cfg.MAX_READING_AGE_MS;

  for (const r of data.results || []) {
    const param = station.sensorParam[r.sensorsId];
    if (!param || !Number.isFinite(r.value) || r.value < 0) continue;

    const when = r.datetime && (r.datetime.utc || r.datetime.local);
    const ts = when ? Date.parse(when) : NaN;
    if (!Number.isFinite(ts) || ts < cutoff || ts > Date.now() + 60000) continue;

    out[param] = r.value;
    if (!out.observedAt || ts > Date.parse(out.observedAt)) {
      out.observedAt = new Date(ts).toISOString();
    }
  }
  return out;
}

export async function fetchLiveStations() {
  const stations = await discoverStations();
  if (!stations.length) throw new Error('OpenAQ: no matching Delhi stations found');

  const settled = await Promise.allSettled(
    stations.map(async (s) => ({ ...s, ...(await fetchStationLatest(s)) }))
  );

  const usable = settled
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((s) => s.pm25 != null || s.pm10 != null)
    .map(({ sensorParam: _sensorParam, ...rest }) => rest);

  if (!usable.length) throw new Error('OpenAQ: no fresh PM readings available');
  return usable;
}

export default { fetchLiveStations, discoverStations };
