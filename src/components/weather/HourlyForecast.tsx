import React from 'react';
import { CloudRain, CloudLightning, Sun, Cloud, CloudFog, Umbrella, Database } from 'lucide-react';
import { HourlyForecastItem } from '../../data/mockWeatherData';
import './HourlyForecast.css';

interface HourlyForecastProps {
  items: HourlyForecastItem[];
  sourceLabel?: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ items, sourceLabel = 'Open-Meteo' }) => {
  const getSmallIcon = (code: string) => {
    switch (code) {
      case 'thunder': return <CloudLightning size={20} className="icon-thunder" />;
      case 'rain': return <CloudRain size={20} className="icon-rain" />;
      case 'cloudy': return <Cloud size={20} className="icon-cloudy" />;
      case 'fog': return <CloudFog size={20} className="icon-fog" />;
      default: return <Sun size={20} className="icon-clear" />;
    }
  };

  return (
    <div className="hourly-forecast-card glass-card">
      <div className="section-header">
        <h3 className="section-title">
          <CloudRain size={20} className="icon-cyan" /> 24-Hour Horizon Forecast
        </h3>
        <span className="badge badge-ai">Live Telemetry ({sourceLabel})</span>
      </div>

      <div className="hourly-timeline-slider">
        {items.map((item, idx) => (
          <div key={idx} className="hourly-item">
            <span className="hourly-time">{item.time}</span>
            <div className="hourly-icon">{getSmallIcon(item.conditionCode)}</div>
            <span className="hourly-temp">{item.temp}°C</span>
            <div className="rain-prob-pill" title={`Rain probability: ${item.precipitationProbability}%`}>
              <Umbrella size={10} />
              <span>{item.precipitationProbability}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
