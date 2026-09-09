import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import './RiskIndicator.css';

interface RiskIndicatorProps {
  level: 'LOW' | 'MODERATE' | 'HIGH';
  score?: number; // 0-100
  showScore?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level, score = 65, showScore = true }) => {
  const getConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          badgeClass: 'risk-high',
          icon: <ShieldAlert size={16} className="risk-icon" />,
          meterColor: '#ef4444'
        };
      case 'MODERATE':
        return {
          label: 'MODERATE RISK',
          badgeClass: 'risk-moderate',
          icon: <AlertTriangle size={16} className="risk-icon" />,
          meterColor: '#f59e0b'
        };
      default:
        return {
          label: 'LOW RISK',
          badgeClass: 'risk-low',
          icon: <ShieldCheck size={16} className="risk-icon" />,
          meterColor: '#10b981'
        };
    }
  };

  const config = getConfig(level);

  return (
    <div className={`risk-indicator-box ${config.badgeClass}`}>
      <div className="risk-indicator-top">
        {config.icon}
        <span className="risk-indicator-label">{config.label}</span>
        {showScore && <span className="risk-score-pill">{score}/100</span>}
      </div>

      {/* Mini Visual Risk Meter */}
      <div className="risk-meter-bar">
        <div
          className="risk-meter-fill"
          style={{ width: `${score}%`, backgroundColor: config.meterColor }}
        ></div>
      </div>
    </div>
  );
};
