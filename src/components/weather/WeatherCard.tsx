import React from 'react';
import {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  CloudFog,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Thermometer,
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { WeatherData } from '../../data/mockWeatherData';
import './WeatherCard.css';

interface WeatherCardProps {
  weather: WeatherData;
  isCached?: boolean;
  cachedAt?: string;
  sourceLabel?: string;
  onSelectCity?: (city: string) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  isCached = false,
  cachedAt,
  sourceLabel = 'Open-Meteo',
  onSelectCity
}) => {
  const renderWeatherIcon = (code: string) => {
    switch (code) {
      case 'thunder': return <CloudLightning size={44} className="icon-weather icon-thunder" />;
      case 'rain': return <CloudRain size={44} className="icon-weather icon-rain" />;
      case 'cloudy': return <Cloud size={44} className="icon-weather icon-cloudy" />;
      case 'fog': return <CloudFog size={44} className="icon-weather icon-fog" />;
      default: return <Sun size={44} className="icon-weather icon-clear" />;
    }
  };

  return (
    <div className="weather-card glass-card">
      {/* Cached Warning Banner if showing stale/cached payload */}
      {isCached && (
        <div className="cache-warning-banner">
          <AlertTriangle size={14} />
          <span>Showing recently cached weather data (Cached: {cachedAt || 'recently'})</span>
        </div>
      )}

      {/* Location & Time Header */}
      <div className="weather-card-header">
        <div>
          <div className="location-row">
            <h2 className="location-name">{weather.city}</h2>
            <span className="location-state">{weather.state ? `${weather.state}, ` : ''}{weather.country}</span>
          </div>
          <span className="last-updated">Updated: {weather.updatedAt}</span>
        </div>

        {/* Data Source Badge */}
        <div className="source-attribution-badge">
          <Database size={13} className="icon-cyan" />
          <span>Forecast source: <strong>{sourceLabel}</strong></span>
        </div>
      </div>

      {/* Primary Main Weather Display */}
      <div className="weather-primary-display">
        <div className="temp-section">
          {renderWeatherIcon(weather.conditionCode)}
          <div>
            <div className="temp-value">
              {weather.temp}<span className="temp-unit">°C</span>
            </div>
            <p className="weather-condition">{weather.condition}</p>
          </div>
        </div>

        <div className="temp-feels">
          <div className="feels-row">
            <Thermometer size={16} className="icon-dim" />
            <span>Feels like: <strong>{weather.feelsLike}°C</strong></span>
          </div>
          <div className="high-low-row">
            <span>High: <strong>{weather.high}°C</strong></span>
            <span>Low: <strong>{weather.low}°C</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of Weather Metrics */}
      <div className="weather-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon-label">
            <Droplets size={16} className="icon-cyan" />
            <span>Relative Humidity</span>
          </div>
          <p className="metric-value">{weather.humidity}%</p>
        </div>

        <div className="metric-box">
          <div className="metric-icon-label">
            <Wind size={16} className="icon-violet" />
            <span>Wind Speed</span>
          </div>
          <p className="metric-value">{weather.windSpeed} <span className="unit">km/h ({weather.windDirection})</span></p>
        </div>

        <div className="metric-box">
          <div className="metric-icon-label">
            <CloudRain size={16} className="icon-amber" />
            <span>Precipitation Risk</span>
          </div>
          <p className="metric-value">{weather.precipitationRisk}%</p>
        </div>

        <div className="metric-box">
          <div className="metric-icon-label">
            <Gauge size={16} className="icon-emerald" />
            <span>Surface Pressure</span>
          </div>
          <p className="metric-value">{weather.pressure} <span className="unit">hPa</span></p>
        </div>
      </div>

      {/* Quick City Switcher Pills */}
      {onSelectCity && (
        <div className="city-selector-bar">
          <span className="selector-label">Quick Cities:</span>
          {['Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Kanchipuram', 'Coimbatore'].map((cityName) => (
            <button
              key={cityName}
              type="button"
              className={`city-pill ${weather.city.toLowerCase() === cityName.toLowerCase() ? 'active' : ''}`}
              onClick={() => onSelectCity(cityName)}
            >
              {cityName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
