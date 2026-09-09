import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Search,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import { searchLocations, fetchWeatherForCurrentLocation } from '../../services/weatherService';
import { ACTIVITIES_CONFIG, ActivityId } from '../../config/activityConfig';
import { analyzeWeatherDecision, DecisionResult } from '../../services/decisionService';
import './DecisionCard.css';

interface DecisionCardProps {
  onAnalyze?: (activity: string, location: LocationSearchResult, timeWindow: string) => void;
  initialLocation?: LocationSearchResult;
  isLoading?: boolean;
}

const POPULAR_LOCATIONS: Array<{
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
}> = [
  { name: 'Chennai', admin1: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Hyderabad', admin1: 'Telangana', country: 'India', latitude: 17.385, longitude: 78.4867 },
  { name: 'Bengaluru', admin1: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', admin1: 'Maharashtra', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Delhi', admin1: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 }
];

export const DecisionCard: React.FC<DecisionCardProps> = ({
  onAnalyze,
  initialLocation,
  isLoading = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(
    initialLocation || {
      id: 1,
      name: 'Hyderabad',
      admin1: 'Telangana',
      country: 'India',
      latitude: 17.385,
      longitude: 78.4867,
      timezone: 'Asia/Kolkata'
    }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedActivityKey, setSelectedActivityKey] = useState<ActivityId>('cricket');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('Evening');

  const [result, setResult] = useState<DecisionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation((prevLoc) => {
        if (
          prevLoc &&
          Math.abs(prevLoc.latitude - initialLocation.latitude) < 0.05 &&
          Math.abs(prevLoc.longitude - initialLocation.longitude) < 0.05
        ) {
          return prevLoc;
        }

        setResult(null);
        return initialLocation;
      });
    }
  }, [initialLocation?.latitude, initialLocation?.longitude, initialLocation?.name]);

  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    setSearchError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim() || text.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(text.trim());
        setSuggestions(results);

        if (results.length === 0) {
          setSearchError('Location not found. Try another city or location.');
        }
      } catch (err) {
        console.error(err);
        setSearchError('Location search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectLocationItem = (loc: LocationSearchResult) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setSuggestions([]);
    setSearchError(null);
    setResult(null);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSuggestions([]);
    setSearchError(null);
    setResult(null);
  };

  const handleUseCurrentLocation = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const weatherCtx = await fetchWeatherForCurrentLocation();
      setSelectedLocation(weatherCtx.location);
      setResult(null);
    } catch (err: any) {
      setSearchError('Location access was denied. Search for a location manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivityChange = (actKey: ActivityId) => {
    setSelectedActivityKey(actKey);
    setResult(null);
  };

  const handleDateChange = (d: string) => {
    setSelectedDate(d);
    setResult(null);
  };

  const handleTimeChange = (t: string) => {
    setSelectedTime(t);
    setResult(null);
  };

  const handleAnalyzeClick = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      setSearchError('Please select or search a location first.');
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await analyzeWeatherDecision(
        selectedActivityKey,
        selectedLocation,
        selectedDate,
        selectedTime
      );

      if (currentRequestId !== requestIdRef.current) {
        console.warn('[RiskAnalyzer] Stale request ignored:', currentRequestId);
        return;
      }

      setResult(res);

      if (onAnalyze) {
        onAnalyze(selectedActivityKey, selectedLocation, selectedTime);
      }
    } catch (err: any) {
      if (currentRequestId !== requestIdRef.current) return;

      console.error('RISK ANALYSIS ERROR:', err);
      setAnalysisError(
        err?.message || 'Unable to analyze weather risk. Please try again.'
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setAnalyzing(false);
      }
    }
  };

  const getRiskLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'SEVERE':
        return 'badge-risk-severe';
      case 'HIGH':
        return 'badge-risk-high';
      case 'ELEVATED':
        return 'badge-risk-elevated';
      case 'MODERATE':
        return 'badge-risk-moderate';
      default:
        return 'badge-risk-low';
    }
  };

  return (
    <div className="decision-analyzer-container glass-card">
      <div className="section-header">
        <h3 className="section-title">
          <Sliders size={20} className="icon-cyan" /> Interactive Activity Risk Analyzer
        </h3>

        <span className="badge badge-ai">
          Deterministic Risk Engine
        </span>
      </div>

      <p className="decision-subtitle">
        Configure any location, date, time window, and activity to compute an evidence-grounded weather risk score and actionable recommendation.
      </p>

      <form onSubmit={handleAnalyzeClick} className="decision-form-grid">

        {/* 1. Location Search & Selector */}
        <div className="form-group-full">
          <div className="form-label-row">
            <label className="form-label">
              <MapPin size={14} className="icon-cyan" /> Location:
            </label>

            {selectedLocation && (
              <button
                type="button"
                className="btn-text-clear"
                onClick={handleClearLocation}
              >
                <X size={12} /> Clear Location
              </button>
            )}
          </div>

          {selectedLocation ? (
            <div className="selected-location-display-box">
              <span className="location-name-text">
                📍 {selectedLocation.name}
                {selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ''}
                , {selectedLocation.country}
              </span>

              <button
                type="button"
                className="btn-change-loc"
                onClick={handleClearLocation}
              >
                Change City
              </button>
            </div>
          ) : (
            <div className="location-search-input-wrapper">
              <Search size={16} className="search-icon" />

              <input
                type="text"
                className="input-field search-location-field"
                placeholder="Search any city or location (e.g. Hyderabad, London, Pune...)"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
              />

              {searchQuery && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => handleQueryChange('')}
                >
                  <X size={14} />
                </button>
              )}

              {suggestions.length > 0 && (
                <ul className="search-suggestions-dropdown glass-card">
                  {suggestions.map((loc) => (
                    <li
                      key={`${loc.latitude}-${loc.longitude}-${loc.name}`}
                      onClick={() => handleSelectLocationItem(loc)}
                      className="suggestion-item"
                    >
                      <MapPin size={14} className="icon-cyan" />

                      <span>
                        <strong>{loc.name}</strong>
                        {loc.admin1 ? `, ${loc.admin1}` : ''}
                        , {loc.country}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="quick-locations-row">
            <button
              type="button"
              className="btn-use-curr-loc"
              onClick={handleUseCurrentLocation}
              disabled={isSearching}
            >
              <MapPin size={13} className="icon-emerald" /> 📍 Use Current Location
            </button>

            <span className="popular-label">Popular:</span>

            {POPULAR_LOCATIONS.map((pop) => (
              <button
                type="button"
                key={pop.name}
                className="pill-popular-city"
                onClick={() =>
                  handleSelectLocationItem({
                    ...pop,
                    id: Date.now(),
                    timezone: 'Asia/Kolkata'
                  })
                }
              >
                {pop.name}
              </button>
            ))}
          </div>

          {searchError && (
            <div className="form-error-toast">
              <AlertCircle size={13} />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* 2. Select Activity */}
        <div className="form-group">
          <label className="form-label">
            <Sparkles size={14} className="icon-cyan" /> Activity:
          </label>

          <select
            className="input-field select-field"
            value={selectedActivityKey}
            onChange={(e) =>
              handleActivityChange(e.target.value as ActivityId)
            }
          >
            {(Object.keys(ACTIVITIES_CONFIG) as ActivityId[]).map((key) => {
              const act = ACTIVITIES_CONFIG[key];

              return (
                <option key={key} value={key}>
                  {act.icon} {act.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* 3. Select Date */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={14} className="icon-amber" /> Date:
          </label>

          <select
            className="input-field select-field"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          >
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="Day After Tomorrow">
              Day After Tomorrow
            </option>
          </select>
        </div>

        {/* 4. Select Time Window */}
        <div className="form-group">
          <label className="form-label">
            <Clock size={14} className="icon-violet" /> Time:
          </label>

          <select
            className="input-field select-field"
            value={selectedTime}
            onChange={(e) => handleTimeChange(e.target.value)}
          >
            <option value="Morning">
              Morning (8:00 AM – 11:00 AM)
            </option>

            <option value="Afternoon">
              Afternoon (12:00 PM – 4:00 PM)
            </option>

            <option value="Evening">
              Evening (5:00 PM – 8:00 PM)
            </option>

            <option value="Night">
              Night (9:00 PM – 11:00 PM)
            </option>
          </select>
        </div>

        {/* Analyze Action Button */}
        <div className="form-group-full form-submit-box">
          <button
            type="submit"
            className="btn btn-primary btn-analyze"
            disabled={analyzing || !selectedLocation || isLoading}
          >
            <Sparkles size={16} />

            <span>
              {analyzing
                ? 'Calculating Risk Factors...'
                : 'Analyze Risk'}
            </span>
          </button>
        </div>
      </form>

      {analysisError && (
        <div
          className="form-error-toast"
          style={{ marginTop: '1rem' }}
        >
          <AlertCircle size={14} />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Ready to Analyze Prompt */}
      {!result && !analyzing && selectedLocation && (
        <div
          className="ready-to-analyze-banner glass-card"
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <CheckCircle
            size={16}
            className="icon-emerald"
            style={{ flexShrink: 0 }}
          />

          {/* CHANGED: Text is now BLACK for visibility */}
          <span
            style={{
              fontSize: '0.88rem',
              color: '#000000'
            }}
          >
            Ready to analyze{' '}
            <strong>
              {ACTIVITIES_CONFIG[selectedActivityKey]?.name || 'Activity'}
            </strong>{' '}
            for{' '}
            <strong>{selectedLocation.name}</strong>{' '}
            ({selectedDate}, {selectedTime}). Click{' '}
            <strong>Analyze Risk</strong> to compute live weather risk.
          </span>
        </div>
      )}

      {/* RESULT DISPLAY PANEL */}
      {result && (
        <div className="risk-result-display-panel glass-card">

          {/* Header Summary */}
          <div className="result-header-bar">
            <div className="result-loc-tag">
              📍 <strong>Location:</strong>{' '}
              {result.location.name}
              {result.location.admin1
                ? `, ${result.location.admin1}`
                : ''}
            </div>

            <div className="result-act-tag">
              {result.activity.icon}{' '}
              <strong>Activity:</strong>{' '}
              {result.activity.name}
            </div>

            <div className="result-time-tag">
              🕐 <strong>Time:</strong>{' '}
              {result.dateStr}, {result.timeRange}
            </div>
          </div>

          <hr className="divider-hr" />

          {/* Risk Score Hero Box */}
          <div className="risk-score-hero">
            <div className="score-number-box">
              <span className="score-num">
                {result.riskScore}
              </span>

              <span className="score-denom">
                / 100
              </span>
            </div>

            <div className="score-level-box">
              <span
                className={`risk-level-badge ${getRiskLevelBadgeClass(
                  result.riskLevel
                )}`}
              >
                {result.riskLevel} RISK
              </span>

              <p className="score-timestamp">
                Calculated live at {result.calculatedAt}
              </p>
            </div>
          </div>

          <hr className="divider-hr" />

          {/* WHY? Factor Mathematical Breakdown */}
          <div className="why-breakdown-section">
            <h4 className="why-title">
              WHY THIS RISK SCORE?
            </h4>

            <div className="factors-list">
              {result.factors.length > 0 ? (
                result.factors.map((f) => (
                  <div
                    key={f.id}
                    className="factor-row"
                  >
                    <span className="factor-explanation">
                      {f.explanation}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-factors-text">
                  No significant weather risk factors detected for this period.
                </p>
              )}
            </div>
          </div>

          <hr className="divider-hr" />

          {/* RECOMMENDATION */}
          <div className="recommendation-section">
            <h4 className="rec-title">
              EVIDENCE-BASED RECOMMENDATION
            </h4>

            <p className="rec-text">
              {result.recommendation}
            </p>
          </div>

          {/* BEST AVAILABLE TIME SUGGESTION */}
          {result.alternativeTimeWindow && (
            <div className="best-time-suggestion-box">
              <div className="best-time-title">
                <TrendingDown
                  size={16}
                  className="icon-emerald"
                />

                <span>
                  BEST AVAILABLE TIME SUGGESTION
                </span>
              </div>

              <p className="best-time-desc">
                Alternative Window:{' '}
                <strong>
                  {result.alternativeTimeWindow.timeRange}
                </strong>{' '}
                (Risk:{' '}
                <strong>
                  {result.alternativeTimeWindow.riskScore}/100
                </strong>{' '}
                – {result.alternativeTimeWindow.riskLevel})
              </p>

              <p className="best-time-sub">
                {result.alternativeTimeWindow.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
