/**
 * Climate Insights Service
 * Delivers historical weather anomaly data, monsoon outlooks, and multi-year climate trends.
 * Currently uses simulated mock data for Step 1.
 */

import { config } from '../config/env';
import { MOCK_CLIMATE_INSIGHTS, ClimateInsight } from '../data/mockWeatherData';

export async function fetchClimateInsights(_region?: string): Promise<ClimateInsight[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!config.isMockMode && config.climateApiKey) {
    // ==========================================
    // // CLIMATE DATA INTEGRATION POINT
    // ==========================================
    // Future call: Fetch ERA5 reanalysis or Copernicus climate datastore historical trends
  }

  return MOCK_CLIMATE_INSIGHTS;
}
