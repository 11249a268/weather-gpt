import React from 'react';
import { BarChart3, TrendingUp, Thermometer, CloudRain, ShieldAlert } from 'lucide-react';
import { ClimateInsight } from '../../data/mockWeatherData';
import './ClimateInsightCard.css';

interface ClimateInsightCardProps {
  insight: ClimateInsight;
}

export const ClimateInsightCard: React.FC<ClimateInsightCardProps> = ({ insight }) => {
  return (
    <div className="climate-card glass-card">
      <div className="section-header">
        <h4 className="section-title">
          <BarChart3 size={20} className="icon-cyan" /> {insight.region}
        </h4>
        <span className="badge badge-ai">Historical Trend</span>
      </div>

      <div className="climate-metrics-row">
        <div className="clim-metric-box">
          <span className="clim-metric-label">
            <CloudRain size={14} className="icon-cyan" /> Rain Anomaly
          </span>
          <span className={`clim-metric-val ${insight.rainfallAnomalyPct > 0 ? 'text-amber' : 'text-blue'}`}>
            {insight.rainfallAnomalyPct > 0 ? `+${insight.rainfallAnomalyPct}%` : `${insight.rainfallAnomalyPct}%`}
          </span>
          <span className="clim-sub">vs 10-Yr Mean</span>
        </div>

        <div className="clim-metric-box">
          <span className="clim-metric-label">
            <Thermometer size={14} className="icon-rose" /> Temp Departure
          </span>
          <span className="clim-metric-val text-rose">
            +{insight.tempDeparture}°C
          </span>
          <span className="clim-sub">Baseline Departure</span>
        </div>

        <div className="clim-metric-box">
          <span className="clim-metric-label">
            <ShieldAlert size={14} className="icon-violet" /> Extreme Events
          </span>
          <span className="clim-metric-val text-violet">
            {insight.extremeEventsCountThisYear}
          </span>
          <span className="clim-sub">Recorded 2026</span>
        </div>
      </div>

      <div className="monsoon-box">
        <h5 className="monsoon-title">Monsoon Outlook</h5>
        <p className="monsoon-desc">{insight.monsoonOutlook}</p>
      </div>

      <div className="comparison-box">
        <span className="comp-label">Climatological Context:</span>
        <p className="comp-text">{insight.historicalComparison}</p>
      </div>
    </div>
  );
};
