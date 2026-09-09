import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import { WeatherData, HourlyForecastItem, DailyForecastItem } from '../data/mockWeatherData';

export type WeatherIntent =
  | 'CURRENT_WEATHER'
  | 'HOURLY_FORECAST'
  | 'DAILY_FORECAST'
  | 'RAIN_QUERY'
  | 'TEMPERATURE_QUERY'
  | 'TRAVEL_DECISION'
  | 'OUTDOOR_ACTIVITY'
  | 'EVENT_PLANNING'
  | 'AGRICULTURE'
  | 'WARNING_QUERY'
  | 'DECISION_QUERY'
  | 'TIME_COMPARISON_QUERY'
  | 'GENERAL_WEATHER';

export type TimePeriod =
  | 'now'
  | 'next_3_hours'
  | 'today'
  | 'tonight'
  | 'tomorrow_morning'
  | 'tomorrow_afternoon'
  | 'tomorrow_evening'
  | 'tomorrow_full'
  | 'at_7_am'
  | 'at_5_pm';

export interface TimeReference {
  period: TimePeriod;
  label: string;
}

export interface WeatherContext {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCondition: string;
    high: number;
    low: number;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  requestedTime: string;
  intent: WeatherIntent;
  provider: string;
  retrievedAt: string;
  isCached: boolean;
  cachedAt?: string;
}

export interface DebugInfo {
  locationName: string;
  coordinates: string;
  intent: WeatherIntent;
  timePeriod: string;
  provider: string;
  retrievedAt: string;
  isCached: boolean;
  cachedAt?: string;
}

