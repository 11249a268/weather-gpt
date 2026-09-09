import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';

export type AlertSeverity = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export type WeatherEventType =
  | 'HEAVY_RAIN'
  | 'VERY_HEAVY_RAIN'
  | 'EXTREMELY_HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'LIGHTNING'
  | 'STRONG_WINDS'
  | 'CYCLONE'
  | 'HEATWAVE'
  | 'COLD_WAVE'
  | 'FLOOD'
  | 'DENSE_FOG'
  | 'NONE';

export interface WeatherAlert {
  id: string;
  source: string;
  isDemo: boolean;
  location: {
    name: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  severity: AlertSeverity;
  eventType: WeatherEventType;
  eventTypeName: string;
  title: string;
  description: string;
  validFrom: string; // ISO string or human readable
  validUntil: string;
  issuedAt: string;
  recommendedAction: string;
  sourceUrl?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED';
  whyExplanation?: string;
}

export interface AlertContext {
  location: LocationSearchResult;
  activeAlerts: WeatherAlert[];
  upcomingAlerts: WeatherAlert[];
  expiredAlerts: WeatherAlert[];
  highestSeverity: AlertSeverity;
  provider: string;
  isDemo: boolean;
  retrievedAt: string;
  hasFailed?: boolean;
  errorMessage?: string;
}

export interface AlertProviderInterface {
  name: string;
  isDemo: boolean;
  getAlertsForLocation(location: LocationSearchResult): Promise<WeatherAlert[]>;
}
