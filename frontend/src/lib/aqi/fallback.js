
const FALLBACK_READINGS = [
  { name: 'Anand Vihar', lat: 28.6473, lon: 77.3153, pm25: 185, pm10: 290 },
  { name: 'Punjabi Bagh', lat: 28.674, lon: 77.133, pm25: 145, pm10: 250 },
  { name: 'Mandir Marg', lat: 28.636, lon: 77.201, pm25: 120, pm10: 210 },
  { name: 'R K Puram', lat: 28.563, lon: 77.187, pm25: 135, pm10: 230 },
  { name: 'Rohini', lat: 28.733, lon: 77.12, pm25: 160, pm10: 270 },
  { name: 'Dwarka Sector 8', lat: 28.571, lon: 77.071, pm25: 140, pm10: 240 },
];

export function getFallbackStations() {
  return FALLBACK_READINGS.map((r, i) => ({
    id: `fallback-${i + 1}`,
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    pm25: r.pm25,
    pm10: r.pm10,
    observedAt: null,
    source: 'synthetic-reference',
    isFallback: true,
  }));
}

export default { getFallbackStations };
