import cfg from './config.js';
import { fetchJson } from './http.js';

export async function fetchHourlyWeather() {
  const url = new URL(cfg.WEATHER_URL);
  url.searchParams.set('latitude', String(cfg.DELHI_CENTER.lat));
  url.searchParams.set('longitude', String(cfg.DELHI_CENTER.lon));
  url.searchParams.set('hourly', 'temperature_2m,wind_speed_10m,boundary_layer_height');
  url.searchParams.set('forecast_days', '2');
  url.searchParams.set('timeformat', 'unixtime');
  url.searchParams.set('timezone', cfg.TZ_NAME);

  try {
    const json = await fetchJson(url.toString());
    const h = json.hourly;
    if (!h || !Array.isArray(h.time)) return null;

    const series = [];
    for (let i = 0; i < h.time.length; i++) {
      series.push({
        time: new Date(h.time[i] * 1000).toISOString(),
        tempC: h.temperature_2m ? h.temperature_2m[i] : null,
        windKmh: h.wind_speed_10m ? h.wind_speed_10m[i] : null,
        blhMeters: h.boundary_layer_height ? h.boundary_layer_height[i] : null,
      });
    }
    return { fetchedAt: new Date().toISOString(), hourly: series };
  } catch (_err) {
    return null;
  }
}

export default { fetchHourlyWeather };
