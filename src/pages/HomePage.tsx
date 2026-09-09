import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { CurrentWeatherSummaryCard } from '../components/weather/CurrentWeatherSummaryCard';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DecisionCard } from '../components/decision/DecisionCard';
import { ClimateInsightCard } from '../components/climate/ClimateInsightCard';
import { ChatContainer } from '../components/chat/ChatContainer';
import { LocationSearchInput } from '../components/weather/LocationSearchInput';
import { HomeAlertCard } from '../components/alerts/HomeAlertCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  fetchWeatherForLocation,
  fetchWeatherForCurrentLocation,
  searchLocations,
  LocationWeatherContext
} from '../services/weatherService';
import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import { getAlertsForLocation } from '../services/alertService';
import { fetchClimateInsights } from '../services/climateService';
import { AlertContext } from '../types/alert';
import { ClimateInsight } from '../data/mockWeatherData';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Getting the latest weather for your location...');
  const [error, setError] = useState<string | null>(null);

  const [context, setContext] = useState<LocationWeatherContext | null>(null);
  const [alertContext, setAlertContext] = useState<AlertContext | null>(null);
  const [climate, setClimate] = useState<ClimateInsight[]>([]);

  // LOCATION REFRESH FLOW: Old location -> Clear old weather state -> Fetch new coordinates -> Update UI
  const loadHomeData = async (loc?: LocationSearchResult) => {
    // 1. Clear old weather state
    setContext(null);
    setAlertContext(null);
    setLoadingMsg('Getting the latest weather for your location...');
    setLoading(true);
    setError(null);

    try {
      const targetLoc: LocationSearchResult = loc || {
        id: 1,
        name: 'Chennai',
        admin1: 'Tamil Nadu',
        country: 'India',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 'Asia/Kolkata'
      };

      // 2. Fetch new coordinates & telemetry
      const weatherCtx = await fetchWeatherForLocation(targetLoc);
      const alertsCtx = await getAlertsForLocation(targetLoc);
      const climateData = await fetchClimateInsights();

      // 3. Update Current Weather, Summary, Forecast, and Warnings
      setContext(weatherCtx);
      setAlertContext(alertsCtx);
      setClimate(climateData);
    } catch (err: any) {
      console.error(err);
      setError('We couldn\'t retrieve the latest weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    loadHomeData(loc);
  };

  const handleUseMyLocation = async () => {
    // Clear old state & show loading
    setContext(null);
    setAlertContext(null);
    setLoadingMsg('Getting the latest weather for your location...');
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeatherForCurrentLocation();
      const alertsCtx = await getAlertsForLocation(result.location);
      setContext(result);
      setAlertContext(alertsCtx);
    } catch (err: any) {
      setError('Location access was denied. Search for a location manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCitySelect = async (cityName: string) => {
    try {
      const searchRes = await searchLocations(cityName);
      if (searchRes.length > 0) {
        loadHomeData(searchRes[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="home-page-container">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="icon-cyan" />
          <span>Weather-Aware Conversational AI • Real-Time Weather Intelligence</span>
        </div>
        <h1 className="hero-title">
          WEATHERGPT
        </h1>
        <h2 className="hero-tagline gradient-text">
          From Weather Data to Better Decisions
        </h2>
        <p className="hero-subtitle">
          An AI-powered conversational weather assistant that combines real weather data, forecasts, warnings and climate information to help users make better weather-related decisions.
        </p>
        <div className="hero-cta-group" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              const el = document.getElementById('weathergpt-chat-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ask WeatherGPT <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => {
              const el = document.getElementById('weather-summary-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Weather
          </button>
        </div>
      </section>

      {/* 2. Location Search Bar */}
      <section className="home-search-section">
        <LocationSearchInput
          onSelectLocation={handleSelectLocation}
          onUseMyLocation={handleUseMyLocation}
          isLoading={loading}
        />
      </section>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Weather Telemetry Notice"
          message={error}
          onRetry={() => loadHomeData(context?.location)}
        />
      )}

      {/* Loading State */}
      {loading && <LoadingState message={loadingMsg} />}

      {/* 3. PROMINENT CURRENT LOCATION WEATHER SUMMARY SECTION (Main Visual Centerpiece) */}
      {!loading && context && (
        <section className="home-current-weather-section" id="weather-summary-section">
          <CurrentWeatherSummaryCard
            weather={context.weather}
            alertContext={alertContext}
            isCached={context.isCached}
            cachedAt={context.cachedAt}
            sourceLabel={context.source}
            onUseCurrentLocation={handleUseMyLocation}
            onRefreshWeather={() => loadHomeData(context.location)}
            isLoading={loading}
          />
        </section>
      )}

      {/* 4. Weather Alert / Status (always shown — GREEN, YELLOW, ORANGE, or RED) */}
      {!loading && alertContext && (
        <section className="home-alert-section" style={{ marginBottom: '1.5rem' }}>
          <HomeAlertCard
            alertContext={alertContext}
            onRefreshAlerts={() => loadHomeData(context?.location)}
            isLoading={loading}
          />
        </section>
      )}

      {/* 5. Weather-Aware Conversational AI Assistant */}
      <section className="home-chat-section" id="weathergpt-chat-container">
        <ChatContainer
          currentLocation={context?.location}
          onRefreshWeather={() => loadHomeData(context?.location)}
        />
      </section>

      {/* 6. Forecast & Interactive Decision Assistant Tools */}
      {!loading && context && (
        <div className="home-sections-grid">
          {/* Hourly Forecast Timeline */}
          <section className="home-section-box">
            <HourlyForecast items={context.hourly} sourceLabel={context.source} />
          </section>

          {/* Decision Assistant Interactive Tool */}
          <section className="home-section-box">
            <DecisionCard
              initialLocation={context?.location}
              isLoading={loading}
            />
          </section>

          {/* Climate Insights Preview */}
          {climate.length > 0 && (
            <section className="home-section-box">
              <div className="section-header">
                <h3 className="section-title">
                  <Compass size={20} className="icon-violet" /> Regional Climate Insights
                </h3>
                <button className="btn btn-secondary" onClick={() => navigate('/climate')}>
                  Full Climate Analytics <ArrowRight size={14} />
                </button>
              </div>
              <ClimateInsightCard insight={climate[0]} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};
