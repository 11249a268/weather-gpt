import React, { useState } from 'react';
import { MapPin, Search, ArrowRightLeft, Thermometer, CloudRain, ShieldCheck } from 'lucide-react';
import { LocationSearchResult, searchLocationsOpenMeteo } from '../../services/weatherProviders/openMeteoProvider';
import { getHistoricalComparison, DualLocationComparisonResult } from '../../services/historicalWeatherService';
import './LocationComparisonComponent.css';

interface LocationComparisonProps {
  primaryLocation: LocationSearchResult;
}

export const LocationComparisonComponent: React.FC<LocationComparisonProps> = ({ primaryLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [secondaryLoc, setSecondaryLoc] = useState<LocationSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [compResult, setCompResult] = useState<DualLocationComparisonResult | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchLocationsOpenMeteo(query);
      setSearchResults(res);
    } catch (e) {
      console.error('Search failed', e);
    }
  };

  const handleSelectSecondary = async (loc: LocationSearchResult) => {
    setSecondaryLoc(loc);
    setSearchResults([]);
    setSearchQuery(loc.name);
    setLoading(true);

    try {
      const res = await getHistoricalComparison(primaryLocation, loc, '30days');
      setCompResult(res);
    } catch (e) {
      console.error('Failed dual comparison', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card dual-location-wrapper">
      <div className="dual-header">
        <div>
          <h4 className="dual-title">
            <ArrowRightLeft size={18} className="icon-cyan" /> Dual Location Climate Comparison
          </h4>
          <p className="dual-subtitle">
            Compare 30-day historical weather telemetry between 📍 <strong>{primaryLocation.name}</strong> and another city.
          </p>
        </div>

        {/* Secondary Location Search */}
        <div className="search-secondary-box" style={{ position: 'relative', width: '260px' }}>
          <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
            <Search size={14} className="icon-cyan" style={{ marginRight: '0.4rem' }} />
            <input
              type="text"
              placeholder="Compare with (e.g. Bengaluru)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', width: '100%', outline: 'none' }}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="search-dropdown-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', marginTop: '4px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {searchResults.slice(0, 5).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectSecondary(loc)}
                  style={{ display: 'block', width: '100%', padding: '0.6rem 0.8rem', textAlign: 'left', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: '0.82rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  📍 {loc.name}, {loc.admin1 || loc.country}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.88rem' }}>
          Comparing historical archive telemetry...
        </div>
      )}

      {!loading && compResult && secondaryLoc && (
        <div className="dual-comparison-content">
          <div className="dual-summary-banner">
            <ShieldCheck size={16} className="icon-emerald" />
            <span>{compResult.summary}</span>
          </div>

          <div className="side-by-side-grid">
            {/* Primary City Card */}
            <div className="city-card primary">
              <div className="city-name">📍 {primaryLocation.name}</div>
              <div className="city-stat">
                <Thermometer size={14} className="icon-amber" />
                <span>30-Day Mean: <strong>{compResult.dataA.currentAvgTemp ?? 'N/A'}°C</strong></span>
              </div>
              <div className="city-stat">
                <CloudRain size={14} className="icon-cyan" />
                <span>Rainfall: <strong>{compResult.dataA.currentTotalRain ?? 'N/A'} mm</strong></span>
              </div>
              <div className="city-baseline">{compResult.dataA.tempDiffLabel}</div>
            </div>

            <div className="vs-divider">VS</div>

            {/* Secondary City Card */}
            <div className="city-card secondary">
              <div className="city-name">📍 {secondaryLoc.name}</div>
              <div className="city-stat">
                <Thermometer size={14} className="icon-amber" />
                <span>30-Day Mean: <strong>{compResult.dataB.currentAvgTemp ?? 'N/A'}°C</strong></span>
              </div>
              <div className="city-stat">
                <CloudRain size={14} className="icon-cyan" />
                <span>Rainfall: <strong>{compResult.dataB.currentTotalRain ?? 'N/A'} mm</strong></span>
              </div>
              <div className="city-baseline">{compResult.dataB.tempDiffLabel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
