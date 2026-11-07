export const cfg = {
  PORT: Number(process.env.PORT) || 5000,
  OPENAQ_BASE: 'https://api.openaq.org/v3',
  OPENAQ_API_KEY: process.env.OPENAQ_API_KEY || '',
  WEATHER_URL: 'https://api.open-meteo.com/v1/forecast',
  CACHE_TTL_MS: 15 * 60 * 1000,
  FALLBACK_TTL_MS: 2 * 60 * 1000,
  STATION_DISCOVERY_TTL_MS: 24 * 60 * 60 * 1000,
  REFRESH_INTERVAL_MS: 14 * 60 * 1000,
  FETCH_TIMEOUT_MS: 4000,
  MAX_READING_AGE_MS: 6 * 60 * 60 * 1000,
  TZ_NAME: 'Asia/Kolkata',
  TZ_OFFSET_MS: 5.5 * 60 * 60 * 1000,
  DELHI_CENTER: { lat: 28.6139, lon: 77.209 },
  SEARCH_RADIUS_M: 25000,
  TARGET_STATIONS: [
    { label: 'Anand Vihar', match: /anand\s*vihar/i },
    { label: 'Punjabi Bagh', match: /punjabi\s*bagh/i },
    { label: 'Mandir Marg', match: /mandir\s*marg/i },
    { label: 'R K Puram', match: /r\.?\s*k\.?\s*puram/i },
    { label: 'Rohini', match: /rohini/i },
    { label: 'Dwarka Sector 8', match: /dwarka.*(sector)?\s*-?\s*8/i },
  ],
};

export default cfg;
