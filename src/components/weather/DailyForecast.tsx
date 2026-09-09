import React from 'react';
import { Calendar, CloudRain, CloudLightning, Sun, Cloud, CloudFog } from 'lucide-react';
import { DailyForecastItem } from '../../data/mockWeatherData';
import './DailyForecast.css';

interface DailyForecastProps {
  items: DailyForecastItem[];
  sourceLabel?: string;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ items, sourceLabel = 'Open-Meteo' }) => {
  const getIcon = (code: string) => {
    switch (code) {
      case 'thunder': return <CloudLightning size={20} className="icon-thunder" />;
      case 'rain': return <CloudRain size={20} className="icon-rain" />;
      case 'cloudy': return <Cloud size={20} className="icon-cloudy" />;
      case 'fog': return <CloudFog size={20} className="icon-fog" />;
      default: return <Sun size={20} className="icon-clear" />;
    }
  };

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'Severe': return 'badge-severe';
      case 'High': return 'badge-high';
      case 'Moderate': return 'badge-moderate';
      default: return 'badge-low';
    }
  };

  return (
    <div className="daily-forecast-card glass-card">
      <div className="section-header">
        <h3 className="section-title">
          <Calendar size={20} className="icon-violet" /> 7-Day Extended Weather Outlook
        </h3>
        <span className="badge badge-ai">7-Day Forecast ({sourceLabel})</span>
      </div>

      <div className="daily-list">
        {items.map((item, idx) => (
          <div key={idx} className="daily-row">
            <div className="day-info">
              <span className="day-name">{item.day}</span>
              <span className="day-date">{item.date}</span>
            </div>

            <div className="condition-info">
              {getIcon(item.conditionCode)}
              <span className="condition-text">{item.condition}</span>
            </div>

            <div className="rain-bar-container">
              <div className="rain-bar-fill" style={{ width: `${item.rainProbability}%` }}></div>
              <span className="rain-pct-text">{item.rainProbability}% Rain</span>
            </div>

            <div className="temp-range">
              <span className="temp-high">{item.high}°</span>
              <span className="temp-low">{item.low}°</span>
            </div>

            <span className={`badge ${getRiskBadgeClass(item.riskLevel)}`}>{item.riskLevel}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
