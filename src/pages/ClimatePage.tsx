import React, { useEffect, useState } from 'react';
import { BarChart3, Database, Globe, Calendar, RefreshCw, MapPin, TrendingUp, AlertCircle, Info, Thermometer, CloudRain, Droplets } from 'lucide-react';
import { ClimateCharts } from '../components/climate/ClimateCharts';
import { HistoricalComparisonComponent } from '../components/climate/HistoricalComparisonComponent';
import { LocationComparisonComponent } from '../components/climate/LocationComparisonComponent';
import { LoadingState } from '../components/ui/LoadingState';
import { fetchHistoricalClimateData, ClimateComparisonResult } from '../services/historicalWeatherService';
import { getActiveWeatherContext } from '../services/weatherService';
import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import './ClimatePage.css';

export const ClimatePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '3months' | '6months' | '1year' | '3years'>('30days');
  const [historicalData, setHistoricalData] = useState<ClimateComparisonResult | null>(null);

  const activeLoc: LocationSearchResult = getActiveWeatherContext()?.location || {
    id: 1,
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  };

  const loadData = async (range: '7days' | '30days' | '3months' | '6months' | '1year' | '3years') => {
    setLoading(true);
    try {
      const data = await fetchHistoricalClimateData(activeLoc, range);
      setHistoricalData(data);
    } catch (e) {
      console.error('Failed to load climate data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeRange);
  }, [activeLoc.id, activeLoc.name, timeRange]);

  return (
    <div className="climate-page-container">
      {/* 1. Header & Title (Requirement 2 & 3) */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={28} className="icon-cyan" /> Climate Intelligence
          </h1>
          <p className="page-subtitle">
            Explore historical weather patterns and long-term trends for 📍 <strong>{activeLoc.name}</strong>.
          </p>
        </div>

        {/* Time Range Selector (Requirement 12) */}
        <div className="time-range-bar glass-card" style={{ padding: '0.4rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['7days', '30days', '3months', '6months', '1year', '3years'] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-sm ${timeRange === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTimeRange(r)}
            >
              {r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : r === '3months' ? '3 Months' : r === '6months' ? '6 Months' : r === '1year' ? '1 Year' : '3 Years'}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingState message={`Retrieving Open-Meteo ERA5 archive telemetry for ${activeLoc.name}...`} />}

      {!loading && historicalData && (
        <div className="climate-dashboard-grid">
          {/* SECTION 1: Historical Overview */}
          <div className="dashboard-section-header">
            <h3 className="section-title">1. Historical Overview</h3>
            <span className="section-period-label">{historicalData.periodLabel}</span>
          </div>

          <div className="climate-metrics-row">
            {/* Metric 1: Temperature */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-label">Average Temperature</span>
                <Thermometer size={16} className="icon-amber" />
              </div>
              <div className="metric-value">{historicalData.currentAvgTemp !== null ? `${historicalData.currentAvgTemp}°C` : 'N/A'}</div>
              <div className="metric-baseline">
                {historicalData.baselineAvgTemp !== null ? `Historical Baseline: ${historicalData.baselineAvgTemp}°C` : 'Baseline unavailable'}
              </div>
            </div>

            {/* Metric 2: Anomaly */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-label">Temperature Anomaly</span>
                {historicalData.tempDiff !== null && (
                  <span className={`badge ${historicalData.tempDiff >= 0 ? 'badge-amber' : 'badge-cyan'}`}>
                    {historicalData.tempDiff >= 0 ? '📈 Above Average' : '📉 Below Average'}
                  </span>
                )}
              </div>
              <div className="metric-value" style={{ color: historicalData.tempDiff !== null && historicalData.tempDiff >= 0 ? '#ef4444' : '#38bdf8' }}>
                {historicalData.tempDiff !== null ? (historicalData.tempDiff >= 0 ? `+${historicalData.tempDiff}°C` : `${historicalData.tempDiff}°C`) : 'N/A'}
              </div>
              <div className="metric-baseline">{historicalData.tempDiffLabel}</div>
            </div>

            {/* Metric 3: Rainfall */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-label">Accumulated Rainfall</span>
                <CloudRain size={16} className="icon-cyan" />
              </div>
              <div className="metric-value">{historicalData.currentTotalRain !== null ? `${historicalData.currentTotalRain} mm` : 'N/A'}</div>
              <div className="metric-baseline">
                {historicalData.baselineTotalRain !== null ? `Historical Baseline: ${historicalData.baselineTotalRain} mm` : 'Baseline unavailable'}
              </div>
            </div>

            {/* Metric 4: Relative Humidity */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <span className="metric-label">Average Humidity</span>
                <Droplets size={16} className="icon-teal" />
              </div>
              <div className="metric-value">{historicalData.currentAvgHumidity !== null ? `${historicalData.currentAvgHumidity}%` : 'N/A'}</div>
              <div className="metric-baseline">
                {historicalData.baselineAvgHumidity !== null ? `Historical Baseline: ${historicalData.baselineAvgHumidity}%` : 'Humidity baseline unavailable'}
              </div>
            </div>
          </div>

          {/* SECTION 2 & 3: Temperature & Rainfall Trends */}
          <div className="dashboard-section-header" style={{ marginTop: '1.5rem' }}>
            <h3 className="section-title">2 &amp; 3. Temperature &amp; Rainfall Trends</h3>
          </div>
          <ClimateCharts data={historicalData} />

          {/* SECTION 4: Multi-Year Comparison */}
          <div className="dashboard-section-header" style={{ marginTop: '1.5rem' }}>
            <h3 className="section-title">4. Historical Comparison</h3>
          </div>
          <HistoricalComparisonComponent location={activeLoc} />

          {/* SECTION 5: Location Comparison */}
          <div className="dashboard-section-header" style={{ marginTop: '1.5rem' }}>
            <h3 className="section-title">5. Location Comparison</h3>
          </div>
          <LocationComparisonComponent primaryLocation={activeLoc} />

          {/* SECTION 6: Climate Insights & Educational Section */}
          <div className="dashboard-section-header" style={{ marginTop: '1.5rem' }}>
            <h3 className="section-title">6. Climate Insights &amp; Concepts</h3>
          </div>

          <div className="climate-insights-wrapper grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
            {/* Climate Insight Cards */}
            <div className="glass-card insight-block" style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                <TrendingUp size={18} className="icon-cyan" />
                <span>Calculated Climate Insights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                <div style={{ padding: '0.6rem', background: 'rgba(30,41,59,0.6)', borderRadius: '8px' }}>
                  🌡️ <strong>Temperature:</strong> {historicalData.tempDiffLabel}
                </div>
                <div style={{ padding: '0.6rem', background: 'rgba(30,41,59,0.6)', borderRadius: '8px' }}>
                  🌧️ <strong>Rainfall:</strong> {historicalData.rainDiffLabel}
                </div>
              </div>
            </div>

            {/* Weather vs Climate Educational Card (Requirement 8 & 25) */}
            <div className="glass-card edu-block" style={{ padding: '1.2rem', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
                <Info size={18} />
                <span>Weather vs. Climate</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>🌦️ Weather:</strong> Short-term atmospheric conditions over hours or days (e.g. <em>"Rain is expected tomorrow in {activeLoc.name}."</em>).
                </p>
                <p style={{ margin: 0 }}>
                  <strong>📊 Climate:</strong> Long-term statistical patterns and historical averages over months or years (e.g. <em>"Rainfall was +{historicalData.rainDiff ?? 0} mm above baseline over the past period."</em>).
                </p>
              </div>
            </div>
          </div>

          {/* Climate Disclaimer (Requirement 26) */}
          <div className="glass-card disclaimer-banner" style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px stroke rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={16} className="icon-amber" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Disclaimer: Historical comparisons describe observed weather patterns in the available data. They do not by themselves establish the cause of long-term climate change.
            </p>
          </div>

          {/* DATA SOURCE TRANSPARENCY (Requirement 6 & 41) */}
          <div className="glass-card source-banner" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                <Database size={16} className="icon-cyan" />
                <span>Data Source: {historicalData.dataSource}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Period Analyzed: <strong>{historicalData.periodLabel}</strong> • Location: <strong>{activeLoc.name}</strong>
              </div>
            </div>
            <span className="badge badge-ai">Retrieved At: {historicalData.retrievedAt}</span>
          </div>
        </div>
      )}
    </div>
  );
};

