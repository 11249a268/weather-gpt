import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeftRight, Clock } from 'lucide-react';
import { compareTimePeriods, TimeComparisonResult } from '../../services/decisionService';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import { ActivityConfig } from '../../config/activityConfig';
import './AlternativeTimeCard.css';

interface AlternativeTimeCardProps {
  alternative?: {
    timeRange: string;
    riskScore: number;
    riskLevel: string;
    explanation: string;
  };
  activity: ActivityConfig;
  location: LocationSearchResult;
  dateStr: string;
}

export const AlternativeTimeCard: React.FC<AlternativeTimeCardProps> = ({
  alternative,
  activity,
  location,
  dateStr
}) => {
  const [compareActive, setCompareActive] = useState(false);
  const [periodA, setPeriodA] = useState('Morning');
  const [periodB, setPeriodB] = useState('Evening');
  const [comparisonResult, setComparisonResult] = useState<TimeComparisonResult | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const handleRunComparison = async () => {
    setLoadingCompare(true);
    try {
      const res = await compareTimePeriods(activity.id, location, dateStr, periodA, periodB);
      setComparisonResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="alternative-time-card-container">
      {/* Requirement 15: Better Time Suggestion Banner */}
      {alternative && (
        <div className="better-window-banner glass-card">
          <div className="banner-top">
            <Sparkles size={18} className="icon-cyan" />
            <h4 className="banner-title">Potentially Better Weather Window</h4>
          </div>
          <p className="banner-desc">
            Based on available forecast telemetry for <strong>{dateStr}</strong>, an alternative time period presents significantly lower weather risk:
          </p>

          <div className="better-window-chip">
            <div className="chip-time">
              <Clock size={16} className="icon-cyan" />
              <span>{alternative.timeRange}</span>
            </div>
            <div className="chip-risk">
              <span>Risk: <strong>{alternative.riskScore}/100</strong> ({alternative.riskLevel})</span>
            </div>
          </div>
          <span className="non-guarantee-note">
            Potentially lower weather risk based on available forecast data.
          </span>
        </div>
      )}

      {/* Requirement 16: Compare Two Time Periods Tool */}
      <div className="time-comparison-box glass-card">
        <div className="comp-header">
          <div className="comp-title-group">
            <ArrowLeftRight size={18} className="icon-cyan" />
            <h4>Compare Two Time Periods</h4>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCompareActive(!compareActive)}
          >
            {compareActive ? 'Hide Comparison' : 'Compare Time Windows'}
          </button>
        </div>

        {compareActive && (
          <div className="comp-body">
            <div className="comp-controls-row">
              <div className="select-box">
                <label>Period A:</label>
                <select className="select-field" value={periodA} onChange={(e) => setPeriodA(e.target.value)}>
                  <option value="Morning">Morning (6 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening">Evening (5 PM - 10 PM)</option>
                  <option value="Night">Night (10 PM - 6 AM)</option>
                </select>
              </div>

              <span className="vs-badge">VS</span>

              <div className="select-box">
                <label>Period B:</label>
                <select className="select-field" value={periodB} onChange={(e) => setPeriodB(e.target.value)}>
                  <option value="Morning">Morning (6 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening">Evening (5 PM - 10 PM)</option>
                  <option value="Night">Night (10 PM - 6 AM)</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-run-comp"
                onClick={handleRunComparison}
                disabled={loadingCompare}
              >
                {loadingCompare ? 'Analyzing...' : 'Run Comparison'}
              </button>
            </div>

            {comparisonResult && (
              <div className="comp-results-grid">
                <div className={`comp-card ${comparisonResult.periodA.riskScore <= comparisonResult.periodB.riskScore ? 'winner' : ''}`}>
                  <h5>{comparisonResult.periodA.label}</h5>
                  <span className="comp-score">Risk: {comparisonResult.periodA.riskScore}/100</span>
                  <span className="comp-level">{comparisonResult.periodA.riskLevel}</span>
                  <div className="comp-telemetry">
                    <span>🌧️ Rain: {comparisonResult.periodA.rainProb}%</span>
                    <span>🌡️ Temp: {comparisonResult.periodA.temp}°C</span>
                    <span>💨 Wind: {comparisonResult.periodA.windSpeed} km/h</span>
                  </div>
                </div>

                <div className={`comp-card ${comparisonResult.periodB.riskScore < comparisonResult.periodA.riskScore ? 'winner' : ''}`}>
                  <h5>{comparisonResult.periodB.label}</h5>
                  <span className="comp-score">Risk: {comparisonResult.periodB.riskScore}/100</span>
                  <span className="comp-level">{comparisonResult.periodB.riskLevel}</span>
                  <div className="comp-telemetry">
                    <span>🌧️ Rain: {comparisonResult.periodB.rainProb}%</span>
                    <span>🌡️ Temp: {comparisonResult.periodB.temp}°C</span>
                    <span>💨 Wind: {comparisonResult.periodB.windSpeed} km/h</span>
                  </div>
                </div>

                <div className="comp-summary-note">
                  💡 {comparisonResult.recommendation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
