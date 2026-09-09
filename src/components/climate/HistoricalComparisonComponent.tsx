import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, CloudRain, Thermometer } from 'lucide-react';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import { fetchMultiYearComparison, MultiYearComparisonResult } from '../../services/historicalWeatherService';
import './HistoricalComparisonComponent.css';

interface HistoricalComparisonProps {
  location: LocationSearchResult;
}

export const HistoricalComparisonComponent: React.FC<HistoricalComparisonProps> = ({ location }) => {
  const [loading, setLoading] = useState(false);
  const [multiYearData, setMultiYearData] = useState<MultiYearComparisonResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadYears = async () => {
      setLoading(true);
      try {
        const currentMonth = new Date().getMonth();
        const res = await fetchMultiYearComparison(location, currentMonth, [2023, 2024, 2025, 2026]);
        if (isMounted) setMultiYearData(res);
      } catch (e) {
        console.error('Failed to load multi-year comparison', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadYears();
    return () => { isMounted = false; };
  }, [location]);

  if (loading) {
    return (
      <div className="glass-card comp-section-wrapper" style={{ padding: '1.25rem' }}>
        <h4 className="comp-title">📊 Multi-Year Historical Comparison</h4>
        <p className="comp-subtitle" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Fetching multi-year archive data from Open-Meteo for {location.name}...
        </p>
      </div>
    );
  }

  if (!multiYearData || !multiYearData.isAvailable || multiYearData.years.length === 0) {
    return (
      <div className="glass-card comp-section-wrapper" style={{ padding: '1.25rem' }}>
        <h4 className="comp-title">📊 Multi-Year Historical Comparison</h4>
        <p className="comp-subtitle" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Multi-year historical comparison is unavailable from the data provider for this location.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card comp-section-wrapper">
      <div className="comp-header-row">
        <div>
          <h4 className="comp-title">
            <Calendar size={18} className="icon-cyan" /> Multi-Year Historical Comparison
          </h4>
          <p className="comp-subtitle">
            Observed average metrics for same month across 2023, 2024, 2025, and 2026 in 📍 {location.name}.
          </p>
        </div>
        <span className="badge badge-ai">ERA5 Archive Data</span>
      </div>

      <div className="years-grid">
        {multiYearData.years.map((y) => (
          <div key={y.year} className={`year-card glass-card ${y.year === 2026 ? 'current-year' : ''}`}>
            <div className="year-header">
              <span className="year-label">{y.periodLabel}</span>
              {y.year === 2026 && <span className="current-pill">Current Year</span>}
            </div>

            <div className="year-metric-item">
              <div className="metric-icon-row">
                <Thermometer size={14} className="icon-amber" />
                <span>Average Temp</span>
              </div>
              <span className="metric-val">{y.avgTemp !== null ? `${y.avgTemp}°C` : 'N/A'}</span>
            </div>

            <div className="year-metric-item">
              <div className="metric-icon-row">
                <CloudRain size={14} className="icon-cyan" />
                <span>Total Rainfall</span>
              </div>
              <span className="metric-val">{y.totalRainfall !== null ? `${y.totalRainfall} mm` : 'N/A'}</span>
            </div>

            <div className="year-range-row">
              <span>High: {y.maxTemp !== null ? `${y.maxTemp}°C` : 'N/A'}</span>
              <span>Low: {y.minTemp !== null ? `${y.minTemp}°C` : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
