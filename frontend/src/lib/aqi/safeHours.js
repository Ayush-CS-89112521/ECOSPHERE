import cfg from './config.js';
import { computeAqi } from './aqi.js';

export const DIURNAL_PROFILE = [
  1.15, 1.18, 1.2, 1.2, 1.18, 1.15, 1.12, 1.15, 1.2, 1.15, 1.05, 0.92,
  0.82, 0.74, 0.7, 0.7, 0.78, 0.92, 1.08, 1.18, 1.2, 1.2, 1.2, 1.18,
];

const WINDOW_HOURS = 2;
const EARLIEST_START = 6;
const LATEST_START = 18;

const pad = (n) => String(n).padStart(2, '0');

function istHour(ms) {
  return Math.floor((ms + cfg.TZ_OFFSET_MS) / 3600000) % 24;
}

function istIso(ms) {
  const d = new Date(ms + cfg.TZ_OFFSET_MS);
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:00:00+05:30`
  );
}

const hhmm = (h) => `${pad(h % 24)}:00`;

function weatherMultipliers(slots, weather) {
  if (!weather) return null;
  const vi = slots.map((s) => {
    const w = weather.get(s.ms);
    if (!w || !Number.isFinite(w.blhM) || !Number.isFinite(w.windKmh)) return null;
    return Math.max(w.blhM, 100) * Math.max(w.windKmh / 3.6, 0.5);
  });
  if (vi.some((v) => v == null)) return null;

  const mean = vi.reduce((a, b) => a + b, 0) / vi.length;
  const raw = vi.map((v) => Math.min(1.6, Math.max(0.6, Math.sqrt(mean / v))));
  const rawMean = raw.reduce((a, b) => a + b, 0) / raw.length;
  return raw.map((r) => r / rawMean);
}

export function calculateSafeHours({ pm25, pm10, nowMs = Date.now(), weather = null }) {
  const hourMs = 3600000;
  const firstSlot = Math.ceil((nowMs + cfg.TZ_OFFSET_MS) / hourMs) * hourMs - cfg.TZ_OFFSET_MS;
  const slots = Array.from({ length: 24 }, (_, i) => {
    const ms = firstSlot + i * hourMs;
    return { ms, hour: istHour(ms) };
  });

  const wMult = weatherMultipliers(slots, weather);
  slots.forEach((s, i) => {
    const climo = DIURNAL_PROFILE[s.hour];
    s.mult = wMult ? 0.4 * climo + 0.6 * climo * wMult[i] : climo;
  });

  const nowHour = istHour(nowMs);
  const nowMult = DIURNAL_PROFILE[nowHour];

  const candidates = [];
  for (let i = 0; i + WINDOW_HOURS <= slots.length; i++) {
    const start = slots[i];
    if (start.hour < EARLIEST_START || start.hour > LATEST_START) continue;
    const avg = slots.slice(i, i + WINDOW_HOURS).reduce((a, s) => a + s.mult, 0) / WINDOW_HOURS;
    candidates.push({ start, avg });
  }

  if (!candidates.length) return null;
  const best = candidates.reduce((a, b) => (b.avg < a.avg ? b : a));
  const worst = candidates.reduce((a, b) => (b.avg > a.avg ? b : a));

  const scale = best.avg / nowMult;
  const estPm25 = pm25 != null ? Math.round(pm25 * scale) : null;
  const estPm10 = pm10 != null ? Math.round(pm10 * scale) : null;
  const est = computeAqi({ pm25: estPm25, pm10: estPm10 });

  const startH = best.start.hour;
  const endH = (startH + WINDOW_HOURS) % 24;
  const improvementPct = Math.max(0, Math.round((1 - best.avg / worst.avg) * 100));

  return {
    window: {
      label: `${hhmm(startH)}-${hhmm(endH)} IST`,
      start: istIso(best.start.ms),
      end: istIso(best.start.ms + WINDOW_HOURS * hourMs),
      startHour: startH,
      endHour: endH,
    },
    estimatedPm25: estPm25,
    estimatedPm10: estPm10,
    estimatedAqi: est ? est.aqi : null,
    estimatedCategory: est ? est.category : null,
    improvementVsWorstWindowPct: improvementPct,
    worstWindowLabel: `${hhmm(worst.start.hour)}-${hhmm((worst.start.hour + WINDOW_HOURS) % 24)} IST`,
    method: wMult ? 'weather-adjusted' : 'climatological',
    confidence: wMult ? 'moderate' : 'low',
    note:
      'Heuristic estimate from typical diurnal mixing-height patterns' +
      (wMult ? ' blended with the hourly wind and boundary-layer forecast' : '') +
      '. It shows relative best timing, not a guaranteed safe AQI.',
    hourly: slots.map((s) => ({
      time: istIso(s.ms),
      hour: s.hour,
      relativeLevel: Number(s.mult.toFixed(2)),
    })),
  };
}

export default { calculateSafeHours, DIURNAL_PROFILE };
