import React from 'react';
import { AlertSeverity } from '../../types/alert';
import './AlertBadge.css';

interface AlertBadgeProps {
  severity: AlertSeverity;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ severity, showIcon = true, size = 'md' }) => {
  const getBadgeInfo = (sev: AlertSeverity) => {
    switch (sev) {
      case 'RED':
        return {
          icon: '🔴',
          label: 'RED — WARNING',
          shortLabel: 'RED WARNING',
          className: 'badge-severity-red'
        };
      case 'ORANGE':
        return {
          icon: '🟠',
          label: 'ORANGE — ALERT',
          shortLabel: 'ORANGE ALERT',
          className: 'badge-severity-orange'
        };
      case 'YELLOW':
        return {
          icon: '🟡',
          label: 'YELLOW — WATCH',
          shortLabel: 'YELLOW WATCH',
          className: 'badge-severity-yellow'
        };
      case 'GREEN':
      default:
        return {
          icon: '🟢',
          label: 'GREEN — NO WARNING',
          shortLabel: 'NO WARNING',
          className: 'badge-severity-green'
        };
    }
  };

  const info = getBadgeInfo(severity);

  return (
    <span className={`alert-severity-badge ${info.className} badge-size-${size}`} role="status">
      {showIcon && <span className="badge-emoji-icon">{info.icon}</span>}
      <span className="badge-text-label">{info.label}</span>
    </span>
  );
};
