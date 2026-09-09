import React from 'react';
import {
  MapPin,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sunrise,
  Sunset,
  Gauge,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { WeatherData } from '../../data/mockWeatherData';
import { AlertContext } from '../../types/alert';
import { generateTodaysWeatherSummary } from '../../utils/summaryGenerator';
import './CurrentWeatherSummaryCard.css';

interface CurrentWeatherSummaryCardProps {
  weather: WeatherData;
  alertContext: AlertContext | null;
  isCached?: boolean;
  cachedAt?: string;
  sourceLabel?: string;
  onUseCurrentLocation: () => void;
  onRefreshWeather: () => void;
  isLoading?: boolean;
}

export const CurrentWeatherSummaryCard: React.FC<CurrentWeatherSummaryCardProps> = ({
  weather,
  alertContext,
  isCached = false,
  cachedAt,
  sourceLabel = 'Open-Meteo API',
  onUseCurrentLocation,
  onRefreshWeather,
  isLoading = false
}) => {
  const summaryText = weather.summary || generateTodaysWeatherSummary(weather);

  const renderWeatherIcon = (code: string) => {
    switch (code) {
      case 'thunder':
        return <CloudLightning size={52} className="summary-weather-icon icon-thunder" />;
      case 'rain':
        return <CloudRain size={52} className="summary-weather-icon icon-rain" />;
      case 'cloudy':
        return <Cloud size={52} className="summary-weather-icon icon-cloudy" />;
      case 'fog':
        return <CloudFog size={52} className="summary-weather-icon icon-fog" />;
      default:
        return <Sun size={52} className="summary-weather-icon icon-clear" />;
    }
  };

  const activeAlert = alertContext?.activeAlerts.find((a) => a.severity !== 'GREEN');

  return (
    <div className="current-weather-summary-card glass-card">
      {/* Top Header Row */}
      <div className="summary-header-row">
        <div className="location-heading-box">
          <div className="location-badge-pill">
            <MapPin size={14} className="icon-cyan" />
            <span>CURRENT LOCATION WEATHER SUMMARY</span>
          </div>
          <h2 className="summary-location-title">
            📍 {weather.city}
            <span className="summary-region">
              {weather.state ? `, ${weather.state}` : ''}, {weather.country}
            </span>
          </h2>
        </div>

        <div className="source-timestamp-pill">
          <span className="live-pulse"></span>
          <span>Source: <strong>{sourceLabel}</strong></span>
          {isCached && <span className="cache-pill">(Cached: {cachedAt})</span>}
        </div>
      </div>

      {/* Main Temperature & Summary Split */}
      <div className="summary-main-display">
        {/* Left: Temp & Condition */}
        <div className="temp-hero-block">
          {renderWeatherIcon(weather.conditionCode)}
          <div>
            <div className="temp-large">
              {weather.temp}<span className="deg-unit">°C</span>
            </div>
            <p className="condition-text">{weather.condition}</p>
            <div className="high-low-pill">
              <span>High: <strong>{weather.high}°C</strong></span>
              <span className="divider">•</span>
              <span>Low: <strong>{weather.low}°C</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Today's Weather Summary Box */}
        <div className="todays-summary-box glass-card">
          <div className="summary-box-title">
            <Sparkles size={16} className="icon-cyan" />
            <span>Today's Weather Summary</span>
          </div>
          <p className="summary-narrative-text">
            "{summaryText}"
          </p>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="summary-metrics-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <Thermometer size={16} className="icon-amber" />
            <span>Feels Like</span>
          </div>
          <p className="metric-tile-value">{weather.feelsLike}°C</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <Droplets size={16} className="icon-cyan" />
            <span>Humidity</span>
          </div>
          <p className="metric-tile-value">{weather.humidity}%</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <Wind size={16} className="icon-violet" />
            <span>Wind Speed</span>
          </div>
          <p className="metric-tile-value">
            {weather.windSpeed} <span className="unit">km/h ({weather.windDirection})</span>
          </p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <CloudRain size={16} className="icon-cyan" />
            <span>Rain Chance</span>
          </div>
          <p className="metric-tile-value">{weather.precipitationRisk}%</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <Eye size={16} className="icon-emerald" />
            <span>Visibility</span>
          </div>
          <p className="metric-tile-value">{weather.visibility} <span className="unit">km</span></p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <Sunrise size={16} className="icon-amber" />
            <span>Sunrise / Sunset</span>
          </div>
          <p className="metric-tile-value" style={{ fontSize: '0.95rem' }}>
            🌅 {weather.sunrise || '06:15 AM'} / 🌆 {weather.sunset || '06:35 PM'}
          </p>
        </div>
      </div>

      {/* Weather Status Banner — always rendered: GREEN (normal) or YELLOW/ORANGE/RED (warning) */}
      {alertContext && (() => {
        if (activeAlert) {
          // Non-GREEN active warning
          return (
            <div className={`summary-active-warning-banner severity-${activeAlert.severity.toLowerCase()}`}>
              <ShieldAlert size={20} className="icon-amber" style={{ flexShrink: 0 }} />
              <div className="warning-banner-body">
                <div className="warning-banner-title-row">
                  <span className="warning-kicker">⚠️ ACTIVE WEATHER WARNING ({activeAlert.severity})</span>
                  <span className="warning-valid-time">Valid: {activeAlert.validFrom} – {activeAlert.validUntil}</span>
                </div>
                <p className="warning-banner-title">{activeAlert.title}</p>
                <p className="warning-banner-action">
                  <strong>Recommendation:</strong> {activeAlert.recommendedAction}
                </p>
              </div>
            </div>
          );
        }
        // GREEN — normal conditions, no active warning
        const greenAlert = alertContext.activeAlerts[0];
        return (
          <div className="summary-active-warning-banner severity-green">
            <ShieldAlert size={20} style={{ flexShrink: 0, color: '#16a34a' }} />
            <div className="warning-banner-body">
              <div className="warning-banner-title-row">
                <span className="warning-kicker" style={{ color: '#15803d' }}>🟢 WEATHER STATUS (GREEN)</span>
                <span className="warning-valid-time">Evaluated: {greenAlert?.validFrom || alertContext.retrievedAt}</span>
              </div>
              <p className="warning-banner-title" style={{ color: '#14532d' }}>
                {greenAlert?.title || 'GREEN STATUS: No Severe Weather Warning'}
              </p>
              <p className="warning-banner-action" style={{ color: '#166534' }}>
                {greenAlert?.description || 'No significant weather hazard detected for this location. Conditions appear normal.'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Footer Bar: Timestamp & Action Buttons */}
      <div className="summary-footer-bar">
        <span className="timestamp-label">
          <Clock size={13} className="icon-cyan" /> Updated: <strong>{weather.updatedAt}</strong>
        </span>

        <div className="action-button-group">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onUseCurrentLocation}
            disabled={isLoading}
            title="Detect browser location and refresh weather"
          >
            <MapPin size={14} className="icon-cyan" />
            <span>📍 Use Current Location</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onRefreshWeather}
            disabled={isLoading}
            title="Refetch latest telemetry from Open-Meteo API"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>🔄 Refresh Weather</span>
          </button>
        </div>
      </div>
    </div>
  );
};
