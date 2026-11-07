const BREAKPOINTS = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
};

const CATEGORIES = [
  { min: 0, max: 50, name: 'Good', color: '#16a34a' },
  { min: 51, max: 100, name: 'Satisfactory', color: '#84cc16' },
  { min: 101, max: 200, name: 'Moderate', color: '#eab308' },
  { min: 201, max: 300, name: 'Poor', color: '#f97316' },
  { min: 301, max: 400, name: 'Very Poor', color: '#ef4444' },
  { min: 401, max: 9999, name: 'Severe', color: '#7f1d1d' },
];

export function linearInterpolate(c, row) {
  if (!Number.isFinite(c) || c < 0) return null;
  const clamped = Math.max(row.cLow, Math.min(c, row.cHigh));
  const ratio = (clamped - row.cLow) / (row.cHigh - row.cLow);
  return Math.round(row.iLow + ratio * (row.iHigh - row.iLow));
}

export function pollutantSubIndex(param, conc) {
  if (!Number.isFinite(conc) || conc < 0) return null;
  const table = BREAKPOINTS[param];
  if (!table) return null;
  for (const row of table) {
    if (conc <= row.cHigh) return linearInterpolate(conc, row);
  }
  const last = table[table.length - 1];
  return linearInterpolate(conc, last);
}

export function aqiCategory(aqi) {
  if (!Number.isFinite(aqi) || aqi < 0) return { name: 'Unknown', color: '#6b7280' };
  return CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) || CATEGORIES[CATEGORIES.length - 1];
}

export function compositeAqi({ pm25, pm10 }) {
  const iPm25 = pollutantSubIndex('pm25', pm25);
  const iPm10 = pollutantSubIndex('pm10', pm10);
  const values = [
    { param: 'pm25', value: iPm25 },
    { param: 'pm10', value: iPm10 },
  ].filter((v) => v.value != null);

  if (!values.length) return null;
  values.sort((a, b) => b.value - a.value);
  const highest = values[0];
  const cat = aqiCategory(highest.value);
  return {
    aqi: highest.value,
    dominantPollutant: highest.param,
    category: cat.name,
    color: cat.color,
    subIndices: { pm25: iPm25, pm10: iPm10 },
  };
}

export const computeAqi = compositeAqi;
export const categorize = (aqi) => aqiCategory(aqi).name;

export default { pollutantSubIndex, aqiCategory, compositeAqi, computeAqi, categorize };
