import React from 'react';
import './RiskGauge.css';

interface RiskGaugeProps {
  score: number; // 0 - 100
  level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const getLevelColor = (l: string) => {
    switch (l) {
      case 'SEVERE':
        return '#ef4444'; // Red
      case 'HIGH':
        return '#f97316'; // Orange
      case 'ELEVATED':
        return '#fbbf24'; // Amber
      case 'MODERATE':
        return '#38bdf8'; // Cyan
      case 'LOW':
      default:
        return '#10b981'; // Emerald
    }
  };

  const currentColor = getLevelColor(level);

  return (
    <div className="risk-gauge-container">
      <div className="gauge-header">
        <span className="gauge-label">Weather Risk Score</span>
        <span className="gauge-score-value" style={{ color: currentColor }}>
          {score} <span className="max-denom">/ 100</span> — <strong className="level-text">{level}</strong>
        </span>
      </div>

      {/* Accessible Progress Gauge Bar */}
      <div
        className="gauge-track-bar"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Weather risk score ${score} out of 100, ${level}`}
      >
        <div
          className="gauge-fill-bar"
          style={{
            width: `${Math.max(5, Math.min(100, score))}%`,
            backgroundColor: currentColor,
            boxShadow: `0 0 12px ${currentColor}80`
          }}
        />
      </div>

      {/* Gauge Scale Labels */}
      <div className="gauge-scale-labels">
        <span>0 (Low)</span>
        <span>20 (Mod)</span>
        <span>40 (Elevated)</span>
        <span>60 (High)</span>
        <span>80 (Severe)</span>
        <span>100</span>
      </div>

      <div className="gauge-disclaimer-note">
        Decision support heuristic — actual conditions may change.
      </div>
    </div>
  );
};
