import { AlertProvider } from './alertProviderInterface';
import { LocationSearchResult } from '../weatherProviders/openMeteoProvider';
import { WeatherAlert } from '../../types/alert';
import { config } from '../../config/env';
import { DemoAlertProvider } from './demoAlertProvider';

export class ImdAlertProvider implements AlertProvider {
  name = 'India Meteorological Department (IMD)';
  isDemo = false;

  private fallbackDemoProvider = new DemoAlertProvider();

  async getAlertsForLocation(location: LocationSearchResult): Promise<WeatherAlert[]> {
    // Check if official IMD alert URL / backend endpoint is configured in env
    if (config.imdAlertApiUrl) {
      try {
        const url = `${config.imdAlertApiUrl}?lat=${location.latitude}&lon=${location.longitude}&district=${encodeURIComponent(location.admin1 || location.name)}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const rawData = await response.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            return rawData.map((item: any, idx: number) => ({
              id: item.id || `imd-alert-${idx}`,
              source: 'India Meteorological Department (IMD)',
              isDemo: false,
              location: {
                name: location.name,
                district: location.admin1 || location.name,
                state: location.country,
                latitude: location.latitude,
                longitude: location.longitude
              },
              severity: (item.severity?.toUpperCase() || 'YELLOW') as any,
              eventType: item.eventType || 'HEAVY_RAIN',
              eventTypeName: item.eventTypeName || 'Weather Alert',
              title: item.title || `${item.severity} Warning: ${location.name}`,
              description: item.description || 'Official IMD weather advisory in effect.',
              validFrom: item.validFrom || 'Now',
              validUntil: item.validUntil || '24h',
              issuedAt: item.issuedAt || new Date().toLocaleString(),
              recommendedAction: item.recommendedAction || 'Follow official IMD guidelines.',
              sourceUrl: item.sourceUrl || 'https://mausam.imd.gov.in',
              status: item.status || 'ACTIVE',
              whyExplanation: `Official IMD alert retrieved for ${location.name} district bounds.`
            }));
          }
        }
      } catch (err) {
        console.warn('[ImdAlertProvider] Failed to reach official IMD endpoint. Falling back to Demo provider.', err);
      }
    }

    // If official credentials/API access are NOT available:
    // Prompt Req 5: DO NOT invent a fake IMD API. Fall back to demo provider showing "Demo warning data".
    return await this.fallbackDemoProvider.getAlertsForLocation(location);
  }
}
