import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldAlert } from 'lucide-react';
import { RiskFactorBreakdown } from '../../config/riskRules';
import { ActivityConfig } from '../../config/activityConfig';
import './RiskFactors.css';

interface RiskFactorsProps {
  factors: RiskFactorBreakdown[];
  totalScore: number;
  activity: ActivityConfig;
  timeRange: string;
  warningOverrideActive: boolean;
  warningDetails?: string;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({
  factors,
  totalScore,
  activity,
  timeRange,
  warningOverrideActive,
  warningDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="risk-factors-container">
      <h4 className="factors-title">Weather Risk Factors & Scoring Breakdown</h4>

      {/* Itemized Factor Badges */}
      <div className="factors-list">
        {factors.length === 0 ? (
          <div className="no-factors-badge">
            🟢 No adverse weather risk factors detected for this period (+0)
          </div>
        ) : (
          factors.map((f) => (
            <div
              key={f.id}
              className={`factor-item-card ${f.isWarningOverride ? 'warning-override' : ''}`}
            >
              <div className="factor-main">
                <span className="factor-icon">{f.icon}</span>
                <div className="factor-text-block">
                  <span className="factor-name">{f.name}</span>
                  <span className="factor-metric">{f.rawMetric}</span>
                </div>
              </div>
              <span className={`factor-points ${f.pointsAdded > 25 ? 'high-points' : ''}`}>
                +{f.pointsAdded} pts
              </span>
            </div>
          ))
        )}
      </div>

      {/* Warning Override Alert Banner (Requirement 11) */}
      {warningOverrideActive && (
        <div className="warning-override-banner">
          <ShieldAlert size={18} className="icon-amber" />
          <div>
            <strong className="banner-head">⚠️ Official Weather Warning Override Active</strong>
            <p className="banner-text">
              {warningDetails || 'Official weather warning polygon overlaps with your location.'} The risk score has been adjusted to prioritize official public safety advisories over raw precipitation probability.
            </p>
          </div>
        </div>
      )}

      {/* Expandable Score Rationale Section (Requirement 13) */}
      <button
        type="button"
        className="btn-toggle-explain"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <HelpCircle size={15} className="icon-cyan" />
        <span>How was this score calculated?</span>
        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {isExpanded && (
        <div className="score-explanation-drawer glass-card">
          <div className="drawer-section">
            <strong>Activity Profile:</strong> {activity.name} ({activity.category})
          </div>
          <div className="drawer-section">
            <strong>Target Time Window:</strong> {timeRange}
          </div>
          <div className="drawer-section">
            <strong>Relevant Factors Evaluated:</strong> {activity.relevantFactors.join(', ')}
          </div>
          <div className="drawer-section">
            <strong>Activity Sensitivity Weights:</strong> Rain (x{activity.rainWeight}), Wind (x{activity.windWeight}), Thunderstorm (x{activity.thunderWeight}), Heat (x{activity.heatWeight}).
          </div>

          <div className="factor-details-table">
            <div className="table-header">
              <span>Factor</span>
              <span>Metric Value</span>
              <span>Weight / Points</span>
            </div>
            {factors.map((f) => (
              <div key={f.id} className="table-row">
                <span>{f.icon} {f.name}</span>
                <span>{f.rawMetric}</span>
                <span className="row-pts">+{f.pointsAdded}</span>
              </div>
            ))}
          </div>

          <p className="heuristic-notice">
            * Note: These are application-level decision-support heuristics tailored for activity planning, NOT official meteorological safety standards.
          </p>
        </div>
      )}
    </div>
  );
};
