import { LocationSearchResult } from '../weatherProviders/openMeteoProvider';
import { WeatherAlert } from '../../types/alert';

export interface AlertProvider {
  name: string;
  isDemo: boolean;
  getAlertsForLocation(location: LocationSearchResult): Promise<WeatherAlert[]>;
}
