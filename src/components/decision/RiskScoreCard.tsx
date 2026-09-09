import React from 'react';
import { AlertTriangle, ShieldCheck, Activity, Info } from 'lucide-react';
import { RiskAnalysis } from '../../data/mockWeatherData';
import './RiskScoreCard.css';

interface RiskScoreCardProps {
  risk: RiskAnalysis;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ risk }) => {
  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'score-severe';
    if (score >= 55) return 'score-high';
    if (score >= 35) return 'score-moderate';
    return 'score-low';
  };

  return (
    <div className="risk-score-card glass-card">
      <div className="section-header">
        <h3 className="section-title">
          <Activity size={20} className="icon-cyan" /> Weather Risk Detection Score
        </h3>
        <span className={`badge badge-${risk.riskLevel.toLowerCase()}`}>
          {risk.riskLevel} Risk
        </span>
      </div>

      <div className="risk-score-main-display">
        {/* Score Gauge Circle */}
        <div className={`score-gauge-box ${getScoreColorClass(risk.overallScore)}`}>
          <span className="score-number">{risk.overallScore}</span>
          <span className="score-max">/100</span>
        </div>

        <div className="risk-score-summary">
          <h4 className="risk-factor-primary">{risk.primaryRiskFactor}</h4>
          <p className="risk-desc">
            AI Risk Detection model calculated from current precip rate, soil moisture saturation, and regional infrastructure vulnerability.
          </p>
        </div>
      </div>

      {/* Factor Breakdown List */}
      <div className="risk-factors-breakdown">
        <h5 className="breakdown-title">Contributing Risk Vectors</h5>
        <div className="factors-list">
          {risk.factors.map((factor, idx) => (
            <div key={idx} className="factor-item">
              <div className="factor-top">
                <span className="factor-name">{factor.name}</span>
                <span className="factor-score">{factor.score}% Risk</span>
              </div>
              <div className="factor-bar-bg">
                <div
                  className={`factor-bar-fill ${getScoreColorClass(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                ></div>
              </div>
              <span className="factor-impact">{factor.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
