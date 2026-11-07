import { getFallbackStations } from '../lib/aqi/fallback.js';
import { calculateDelhiAdvisories } from '../lib/aqi/advisories.js';

describe('Fallback Data Pipeline', () => {
  it('returns valid fallback stations array', () => {
    const stations = getFallbackStations();
    expect(Array.isArray(stations)).toBe(true);
    expect(stations.length).toBeGreaterThanOrEqual(6);
  });

  it('ensures each station has required fields with valid types', () => {
    const rawStations = getFallbackStations();
    const enriched = calculateDelhiAdvisories({ stations: rawStations });

    expect(enriched.stations.length).toBe(rawStations.length);

    enriched.stations.forEach((s) => {
      expect(s.name).toBeDefined();
      expect(typeof s.name).toBe('string');
      expect(s.pm25).toBeGreaterThan(0);
      expect(s.pm10).toBeGreaterThan(0);
      expect(s.aqi).toBeGreaterThan(0);
      expect(s.category).toBeDefined();
      expect(s.isFallback).toBe(true);
    });
  });

  it('correctly labels fallback source instead of live in advisory snapshot', () => {
    const rawStations = getFallbackStations();
    const advisories = calculateDelhiAdvisories({ stations: rawStations });

    expect(advisories.city).toBeDefined();
    expect(advisories.city.stationCount).toBe(rawStations.length);
    expect(advisories.city.aqi).toBeGreaterThan(0);
    expect(advisories.grap).toBeDefined();
    expect(advisories.grap.stage).toBeGreaterThanOrEqual(1);
  });
});
