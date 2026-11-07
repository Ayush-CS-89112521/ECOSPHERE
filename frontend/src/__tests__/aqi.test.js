import { pollutantSubIndex, aqiCategory, compositeAqi, categorize } from '../lib/aqi/aqi.js';

describe('AQI Engine - Breakpoints & Interpolation', () => {
  describe('PM2.5 Sub-Index', () => {
    it('calculates Good range (0-30)', () => {
      expect(pollutantSubIndex('pm25', 0)).toBe(0);
      expect(pollutantSubIndex('pm25', 15)).toBe(25);
      expect(pollutantSubIndex('pm25', 30)).toBe(50);
    });

    it('calculates Satisfactory range (31-60)', () => {
      expect(pollutantSubIndex('pm25', 31)).toBe(51);
      expect(pollutantSubIndex('pm25', 60)).toBe(100);
    });

    it('calculates Moderate range (61-90)', () => {
      expect(pollutantSubIndex('pm25', 61)).toBe(101);
      expect(pollutantSubIndex('pm25', 90)).toBe(200);
    });

    it('calculates Poor range (91-120)', () => {
      expect(pollutantSubIndex('pm25', 91)).toBe(201);
      expect(pollutantSubIndex('pm25', 120)).toBe(300);
    });

    it('calculates Very Poor range (121-250)', () => {
      expect(pollutantSubIndex('pm25', 121)).toBe(301);
      expect(pollutantSubIndex('pm25', 250)).toBe(400);
    });

    it('calculates Severe range (>250)', () => {
      expect(pollutantSubIndex('pm25', 251)).toBe(401);
      expect(pollutantSubIndex('pm25', 500)).toBe(500);
    });
  });

  describe('PM10 Sub-Index', () => {
    it('calculates Good range (0-50)', () => {
      expect(pollutantSubIndex('pm10', 0)).toBe(0);
      expect(pollutantSubIndex('pm10', 50)).toBe(50);
    });

    it('calculates Satisfactory range (51-100)', () => {
      expect(pollutantSubIndex('pm10', 51)).toBe(51);
      expect(pollutantSubIndex('pm10', 100)).toBe(100);
    });

    it('calculates Moderate range (101-250)', () => {
      expect(pollutantSubIndex('pm10', 101)).toBe(101);
      expect(pollutantSubIndex('pm10', 250)).toBe(200);
    });

    it('calculates Poor range (251-350)', () => {
      expect(pollutantSubIndex('pm10', 251)).toBe(201);
      expect(pollutantSubIndex('pm10', 350)).toBe(300);
    });

    it('calculates Very Poor range (351-430)', () => {
      expect(pollutantSubIndex('pm10', 351)).toBe(301);
      expect(pollutantSubIndex('pm10', 430)).toBe(400);
    });

    it('calculates Severe range (>430)', () => {
      expect(pollutantSubIndex('pm10', 431)).toBe(401);
      expect(pollutantSubIndex('pm10', 600)).toBe(500);
    });
  });

  describe('Boundary and Invalid Inputs', () => {
    it('handles boundary values correctly', () => {
      expect(pollutantSubIndex('pm25', 30)).toBe(50);
      expect(pollutantSubIndex('pm25', 31)).toBe(51);
      expect(pollutantSubIndex('pm25', 60)).toBe(100);
      expect(pollutantSubIndex('pm25', 61)).toBe(101);
    });

    it('handles invalid and negative inputs gracefully', () => {
      expect(pollutantSubIndex('pm25', null)).toBeNull();
      expect(pollutantSubIndex('pm25', undefined)).toBeNull();
      expect(pollutantSubIndex('pm25', -1)).toBeNull();
      expect(pollutantSubIndex('pm25', NaN)).toBeNull();
      expect(pollutantSubIndex('unknown_param', 50)).toBeNull();
    });
  });

  describe('AQI Categories & Composite', () => {
    it('maps AQI values to official categories', () => {
      expect(categorize(40)).toBe('Good');
      expect(categorize(75)).toBe('Satisfactory');
      expect(categorize(150)).toBe('Moderate');
      expect(categorize(250)).toBe('Poor');
      expect(categorize(350)).toBe('Very Poor');
      expect(categorize(450)).toBe('Severe');
      expect(aqiCategory(null).name).toBe('Unknown');
    });

    it('computes composite AQI determining dominant pollutant', () => {
      const res = compositeAqi({ pm25: 140, pm10: 200 });
      // PM2.5 of 140 is in Very Poor (301-400)
      // PM10 of 200 is in Moderate (101-200)
      expect(res.dominantPollutant).toBe('pm25');
      expect(res.category).toBe('Very Poor');
      expect(res.aqi).toBeGreaterThanOrEqual(301);
    });

    it('returns null when all inputs are missing or null', () => {
      expect(compositeAqi({ pm25: null, pm10: null })).toBeNull();
    });
  });
});
