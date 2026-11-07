const numeric = (n) => Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
const text = (s, fallback = 'Unavailable') => typeof s === 'string' ? s : fallback;
const pollutant = (s) => s === 'pm25' ? 'PM2.5' : s === 'pm10' ? 'PM10' : '\u2014';

export function transformApiResponse(api) {
  if (!api || !api.meta || !['openaq', 'fallback'].includes(api.meta.source) || !api.city || !Array.isArray(api.stations)) {
    throw new Error('Invalid telemetry response');
  }
  const { meta, city } = api;
  const fallback = meta.source === 'fallback';
  const live = meta.source === 'openaq' && meta.isLive === true && meta.stale === false;
  const observed = Date.parse(meta.latestObservationAt);
  const window = api.safeHours?.window;
  const start = Number.isFinite(window?.startHour) ? Math.max(6, Math.min(21, window.startHour)) : 6;
  const end = Number.isFinite(window?.endHour) ? Math.max(start, Math.min(21, window.endHour)) : start;
  return {
    city: 'Delhi NCR',
    grapStatus: fallback ? 'Illustrative GRAP band' : api.grap ? `Indicative GRAP: ${text(api.grap.label)}` : 'GRAP unavailable',
    grapStage: String(api.grap?.stage ?? '\u2014'),
    isLive: live,
    dataSource: fallback ? 'Synthetic reference (not observations)' : live ? meta.cache?.hit ? 'OpenAQ v3 (cached)' : 'OpenAQ v3' : 'Unavailable or stale',
    lastUpdated: Number.isFinite(observed) && !fallback ? new Date(observed).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) + ' IST' : 'No observation timestamp',
    aqi: numeric(city.aqi), riskLevel: text(city.category, 'Unknown'),
    dominantPollutant: pollutant(city.dominantPollutant), pm25: numeric(city.pm25), pm10: numeric(city.pm10),
    healthTip: fallback ? 'Synthetic example only. Check current official observations before planning outdoor activity.' : text(api.healthTip),
    outdoorNowText: fallback ? 'Illustrative values; current conditions unknown.' : text(api.outdoor?.now?.text),
    safeToRunNow: fallback ? null : typeof api.outdoor?.now?.safeToRun === 'boolean' ? api.outdoor.now.safeToRun : null,
    restrictions: Array.isArray(api.grap?.restrictions) ? api.grap.restrictions.filter((s) => typeof s === 'string') : [],
    safeWindow: {
      timeRange: text(window?.label), description: fallback ? 'Illustrative estimate only.' : text(api.outdoor?.bestWindow?.text),
      startPercent: Math.round((start - 6) / 15 * 100), endPercent: Math.round((end - 6) / 15 * 100),
      estimatedAqi: numeric(api.outdoor?.bestWindow?.estimatedAqi) ?? undefined,
    },
    stations: api.stations.filter((s) => s && typeof s.name === 'string').map((s, i) => ({
      id: s.id ?? i, name: s.name, area: text(s.area, 'Delhi NCR'), pm25: numeric(s.pm25), pm10: numeric(s.pm10),
      aqi: numeric(s.aqi), category: text(s.category, 'Unknown'), status: text(s.category, 'Unknown'),
      dominantPollutant: pollutant(s.dominantPollutant),
    })),
  };
}
