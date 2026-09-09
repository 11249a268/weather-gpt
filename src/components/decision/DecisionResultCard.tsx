import React, { useState } from 'react';
import { MapPin, Clock, Share2, Check, ShieldCheck, Database, Info } from 'lucide-react';
import { DecisionResult } from '../../services/decisionService';
import { RiskGauge } from './RiskGauge';
import { RiskFactors } from './RiskFactors';
import './DecisionResultCard.css';

interface DecisionResultCardProps {
  result: DecisionResult;
}

export const DecisionResultCard: React.FC<DecisionResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    const textSummary = `WeatherGPT Activity Risk Assessment\n` +
      `Activity: ${result.activity.name}\n` +
      `Location: ${result.location.name}${result.location.admin1 ? `, ${result.location.admin1}` : ''}\n` +
      `Time Window: ${result.dateStr}, ${result.timeRange}\n` +
      `Risk Score: ${result.riskScore}/100 (${result.riskLevel})\n` +
      `Recommendation: ${result.recommendation}\n` +
      `Assessment Basis: Forecast telemetry + IMD Alert feeds. Conditions may change.`;

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getRecommendationBadgeStyle = (level: string) => {
    switch (level) {
      case 'VERY HIGH':
        return { border: '1px solid rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171' };
      case 'HIGH':
        return { border: '1px solid rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.1)', color: '#fb923c' };
      case 'MODERATE':
        return { border: '1px solid rgba(234, 179, 8, 0.4)', bg: 'rgba(234, 179, 8, 0.1)', color: '#facc15' };
      case 'LOW':
      case 'VERY LOW':
      default:
        return { border: '1px solid rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399' };
    }
  };

  const recStyle = getRecommendationBadgeStyle(result.riskLevel);

  return (
    <div className="decision-result-card glass-card">
      {/* Header Section */}
      <div className="result-header">
        <div className="result-title-group">
          <span className="result-act-icon">{result.activity.icon}</span>
          <div>
            <h2 className="result-act-title">
              {result.customActivityName ? `Custom: ${result.customActivityName}` : result.activity.name}
            </h2>
            <div className="result-meta-line">
              <span className="meta-chip"><MapPin size={13} /> {result.location.name}, {result.location.admin1 || result.location.country}</span>
              <span className="meta-chip"><Clock size={13} /> {result.dateStr} • {result.timeRange}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-share-assessment"
          onClick={handleShareClick}
        >
          {copied ? <Check size={14} className="icon-emerald" /> : <Share2 size={14} />}
          <span>{copied ? 'Summary Copied!' : 'Share Assessment'}</span>
        </button>
      </div>

      {/* Visual Risk Gauge (Requirement 28) */}
      <RiskGauge score={result.riskScore} level={result.riskLevel} />

      {/* Recommendation Card (Requirement 14) */}
      <div
        className="recommendation-banner"
        style={{ background: recStyle.bg, borderColor: recStyle.border, color: recStyle.color }}
      >
        <ShieldCheck size={20} />
        <div>
          <strong className="rec-label">Decision Support Recommendation:</strong>
          <p className="rec-text">{result.recommendation}</p>
        </div>
      </div>

      {/* Itemized Risk Factors & Rationale (Requirement 12 & 13) */}
      <RiskFactors
        factors={result.factors}
        totalScore={result.riskScore}
        activity={result.activity}
        timeRange={result.timeRange}
        warningOverrideActive={result.warningOverrideActive}
        warningDetails={result.warningDetails}
      />

      {/* Requirement 25: Assessment Basis & Data Quality */}
      <div className="assessment-basis-footer">
        <div className="basis-chips-row">
          <span className="basis-label"><Info size={13} /> Assessment Basis:</span>
          <span className="basis-chip">✓ Forecast Telemetry</span>
          <span className="basis-chip">✓ IMD Warning Feed</span>
          <span className="basis-chip">✓ Activity Profile ({result.activity.name})</span>
          <span className="basis-chip">✓ Time Period ({result.timeRange})</span>
        </div>

        {/* Data Freshness Indicator (Requirement 24) */}
        <div className="freshness-row">
          <Database size={13} className="icon-cyan" />
          <span>Weather data updated: {result.weatherDataTimestamp} • Warning data updated: {result.warningDataTimestamp}</span>
          {result.isStaleData && <span className="stale-warning">(Cached telemetry)</span>}
        </div>

        {/* Safety Disclaimer (Requirement 39) */}
        <p className="safety-disclaimer-text">
          WeatherGPT provides forecast-based decision support, not guaranteed safety advice. Always follow official weather warnings and local authority guidance.
        </p>
      </div>
    </div>
  );
};
