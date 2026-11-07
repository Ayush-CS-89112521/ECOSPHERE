import { computeAqi, categorize } from './aqi.js';
import { getGrapStage } from './grap.js';
import { calculateSafeHours } from './safeHours.js';

function mean(values) {
  const v = values.filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function outdoorVerdict(aqi) {
  if (aqi == null) return { level: 'unknown', safeToRun: null, text: 'No air quality data available.' };
  if (aqi <= 100) return { level: 'ok', safeToRun: true, text: 'Fine for outdoor exercise.' };
  if (aqi <= 200) {
    return {
      level: 'caution',
      safeToRun: true,
      text: 'Acceptable for most people. Asthma, heart or lung patients should take it easy.',
    };
  }
  if (aqi <= 300) {
    return { level: 'limit', safeToRun: false, text: 'Not great for running. Keep to light walks and wear an N95.' };
  }
  if (aqi <= 400) {
    return { level: 'avoid', safeToRun: false, text: 'Do not run or exercise outdoors. Move workouts indoors.' };
  }
  return { level: 'hazardous', safeToRun: false, text: 'Hazardous. Stay indoors; go out only if essential, with an N95.' };
}

export function buildHealthTip(aqi, safeHours) {
  const win = safeHours ? safeHours.window?.label : null;
  const timing = win ? ` If you must go out, the best slot is ${win}.` : '';

  if (aqi == null) return 'Air quality data is unavailable right now. Check back shortly.';
  if (aqi <= 100) return 'Air is acceptable. Enjoy outdoor activity, and sensitive people should keep an inhaler handy.';
  if (aqi <= 200) {
    return `Moderate air. Sensitive groups (children, elderly, asthma) should cut back on long outdoor exertion.${timing}`;
  }
  if (aqi <= 300) {
    return (
      'Poor air. A mask (N95) is advised outdoors. Avoid morning jogs before 9 AM and after sunset, ' +
      `when pollution peaks.${timing}`
    );
  }
  if (aqi <= 400) {
    return (
      'Very poor air. N95 mask is a must outdoors. Skip outdoor workouts, avoid morning jogs before 9 AM, ' +
      `keep windows closed and run an air purifier if you have one.${timing}`
    );
  }
  return (
    'Severe air. N95 mask mandatory for any outdoor trip. Stay indoors, keep children and elderly inside, ' +
    `avoid all outdoor exercise and avoid mornings before 9 AM entirely.${timing}`
  );
}

export function calculateDelhiAdvisories(aqiData) {
  const { stations = [], weather = null, nowMs = Date.now() } = aqiData || {};

  const enriched = stations.map((s) => {
    const r = computeAqi({ pm25: s.pm25, pm10: s.pm10 });
    return { ...s, aqi: r ? r.aqi : null, category: r ? r.category : 'Unknown', dominantPollutant: r ? r.dominantPollutant : null };
  });

  const cityPm25 = mean(enriched.map((s) => s.pm25));
  const cityPm10 = mean(enriched.map((s) => s.pm10));
  const city = computeAqi({ pm25: cityPm25, pm10: cityPm10 }) || { aqi: null, category: 'Unknown', dominantPollutant: null };

  const worst = enriched.filter((s) => s.aqi != null).sort((a, b) => b.aqi - a.aqi)[0] || null;

  const grap = getGrapStage(city.aqi) || { stage: 0, label: 'Normal', aqiBand: 'AQI 0-200', restrictions: [], citizenActions: [] };
  const safeHours = city.aqi == null ? null : calculateSafeHours({ pm25: cityPm25, pm10: cityPm10, nowMs, weather });

  const now = outdoorVerdict(city.aqi);
  const bestWindow = safeHours
    ? { ...outdoorVerdict(safeHours.estimatedAqi), window: safeHours.window?.label, estimatedAqi: safeHours.estimatedAqi }
    : null;

  return {
    city: {
      aqi: city.aqi,
      category: city.category,
      dominantPollutant: city.dominantPollutant,
      pm25: cityPm25 == null ? null : Math.round(cityPm25),
      pm10: cityPm10 == null ? null : Math.round(cityPm10),
      stationCount: enriched.length,
      mostPollutedStation: worst ? { name: worst.name, aqi: worst.aqi, category: categorize(worst.aqi) } : null,
    },
    stations: enriched,
    grap: {
      stage: grap.stage,
      label: grap.label,
      aqiBand: grap.aqiBand,
      indicative: true,
      restrictions: grap.restrictions,
      citizenActions: grap.citizenActions,
      inheritsFromLowerStages: !!grap.inheritsFromLowerStages,
      nextStageIn: grap.nextStageIn,
      nextStageLabel: grap.nextStageLabel,
    },
    outdoor: { now, bestWindow },
    safeHours,
    healthTip: buildHealthTip(city.aqi, safeHours),
  };
}

export default { calculateDelhiAdvisories, outdoorVerdict, buildHealthTip };
