import React from 'react';
import { AlertOctagon, AlertTriangle, Info, Bell, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { WeatherAlert } from '../../types/alert';
import './AlertCard.css';

interface AlertCardProps {
  alert: WeatherAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'RED':
      case 'EMERGENCY':
        return { badgeClass: 'badge-severe', icon: <AlertOctagon size={24} className="alert-icon severe" /> };
      case 'ORANGE':
      case 'WARNING':
        return { badgeClass: 'badge-high', icon: <AlertTriangle size={24} className="alert-icon high" /> };
      case 'YELLOW':
      case 'WATCH':
        return { badgeClass: 'badge-moderate', icon: <Bell size={24} className="alert-icon moderate" /> };
      default:
        return { badgeClass: 'badge-low', icon: <Info size={24} className="alert-icon low" /> };
    }
  };

  const config = getSeverityConfig(alert.severity);

  return (
    <div className={`alert-card glass-card alert-border-${alert.severity.toLowerCase()}`}>
      <div className="alert-top">
        <div className="alert-title-box">
          {config.icon}
          <div>
            <h4 className="alert-title-text">{alert.title}</h4>
            <div className="alert-meta-row">
              <span className="alert-meta-item">
                <MapPin size={13} /> {alert.location?.district || alert.location?.name || 'District'}
              </span>
              <span className="alert-meta-item">
                <Clock size={13} /> Valid until: {alert.validUntil}
              </span>
            </div>
          </div>
        </div>
        <span className={`badge ${config.badgeClass}`}>{alert.severity}</span>
      </div>

      <p className="alert-description">{alert.description}</p>

      <div className="alert-action-protocol">
        <ShieldCheck size={16} className="icon-cyan" />
        <div>
          <span className="protocol-label">Safety Action Protocol:</span>
          <p className="protocol-text">{alert.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
};

