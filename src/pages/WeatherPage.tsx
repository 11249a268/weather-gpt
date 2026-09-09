import React, { useEffect, useState } from 'react';
import { CloudSun, Layers, Database, AlertCircle } from 'lucide-react';
import { LocationSearchInput } from '../components/weather/LocationSearchInput';
import { WeatherCard } from '../components/weather/WeatherCard';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DailyForecast } from '../components/weather/DailyForecast';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  fetchWeatherForLocation,
  fetchWeatherForCurrentLocation,
  searchLocations,
  LocationWeatherContext
} from '../services/weatherService';
import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import './WeatherPage.css';

export const WeatherPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<LocationWeatherContext | null>(null);

  const loadInitialWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // Default to Chennai or saved location in localStorage
      const defaultLoc: LocationSearchResult = {
        id: 1,
        name: 'Chennai',
        admin1: 'Tamil Nadu',
        country: 'India',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 'Asia/Kolkata'
      };

      const result = await fetchWeatherForLocation(defaultLoc);
      setContext(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "We couldn't retrieve weather data right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialWeather();
  }, []);

  const handleSelectLocation = async (loc: LocationSearchResult) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeatherForLocation(loc);
      setContext(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch forecast for selected location.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeatherForCurrentLocation();
      setContext(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Location access was denied. Search for a city instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCitySelect = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const searchRes = await searchLocations(cityName);
      if (searchRes.length > 0) {
        await handleSelectLocation(searchRes[0]);
      } else {
        setError(`Could not find coordinates for ${cityName}.`);
      }
    } catch (err: any) {
      setError(`Failed to search ${cityName}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-page-container">
      {/* Header & Location Search Controls */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CloudSun size={28} className="icon-cyan" /> Weather Telemetry Dashboard
          </h1>
          <p className="page-subtitle">
            Live Open-Meteo forecast observations, location geocoding & 7-day extended outlook.
          </p>
        </div>
      </div>

      {/* Real Location Search Bar + Use My Location */}
      <LocationSearchInput
        onSelectLocation={handleSelectLocation}
        onUseMyLocation={handleUseMyLocation}
        isLoading={loading}
      />

      {/* Error State Banner */}
      {error && (
        <ErrorState
          title="Location / Weather Error"
          message={error}
          onRetry={loadInitialWeather}
        />
      )}

      {/* Loading Skeleton State */}
      {loading && <LoadingState message="Connecting to Open-Meteo Meteorological Forecast API..." />}

      {/* Real Weather Dashboard */}
      {!loading && context && (
        <div className="weather-dashboard-grid">
          {/* Current Weather Telemetry Card */}
          <WeatherCard
            weather={context.weather}
            isCached={context.isCached}
            cachedAt={context.cachedAt}
            sourceLabel={context.source}
            onSelectCity={handleQuickCitySelect}
          />

          {/* 24-Hour Horizon Forecast */}
          <HourlyForecast items={context.hourly} sourceLabel={context.source} />

          {/* 7-Day Extended Forecast */}
          <DailyForecast items={context.daily} sourceLabel={context.source} />

          {/* Provider Architecture & IMD Integration Card */}
          <div className="glass-card integration-card">
            <div className="section-header">
              <h4 className="section-title">
                <Database size={18} className="icon-cyan" /> Forecast Provider Architecture
              </h4>
              <span className="badge badge-ai">Open-Meteo Active</span>
            </div>
            <p className="integration-text">
              // IMD PROVIDER SLOT: Current weather provider is Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`). Future official IMD AWS ground sensors can be registered in `src/services/weatherProviders/imdProvider.ts`.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
