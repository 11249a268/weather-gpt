import React from 'react';
import { Database, ShieldCheck, ExternalLink, X, Info } from 'lucide-react';
import './DataSourcesModal.css';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-card">
        <div className="modal-header">
          <div className="modal-title">
            <Database className="icon-cyan" size={22} />
            <span>WeatherGPT Data Sources & Transparency</span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="transparency-intro">
            WeatherGPT adheres to a strict <strong>Zero-Hallucination Source-of-Truth Rule</strong>. All weather facts, forecasts, warnings, and climate baselines are queried in real time from empirical meteorological providers:
          </p>

          <div className="source-item glass-card">
            <div className="source-title-row">
              <span className="source-name">🌦️ Open-Meteo Forecast API</span>
              <span className="badge badge-cyan">Live Telemetry</span>
            </div>
            <p className="source-desc">
              Provides high-resolution hourly, daily, precipitation, wind vector, and cloud cover telemetry derived from DWD ICON and GFS global models.
            </p>
            <span className="source-meta">Latency: &lt; 250ms • Resolution: 11 km</span>
          </div>

          <div className="source-item glass-card">
            <div className="source-title-row">
              <span className="source-name">⚠️ India Meteorological Department (IMD)</span>
              <span className="badge badge-amber">Official Advisories</span>
            </div>
            <p className="source-desc">
              Provides official severe weather warning bulletins, cyclone advisories, and color-coded district alert classifications (GREEN, YELLOW, ORANGE, RED).
            </p>
            <span className="source-meta">Coverage: Indian Subcontinent &amp; Coastal Districts</span>
          </div>

          <div className="source-item glass-card">
            <div className="source-title-row">
              <span className="source-name">📊 Open-Meteo Historical Archive API</span>
              <span className="badge badge-ai">Historical Climate</span>
            </div>
            <p className="source-desc">
              Stores 10+ year historical temperature, rainfall, and climate baselines used for long-term anomaly comparisons.
            </p>
            <span className="source-meta">Period: 2014 – 2026 Archive Records</span>
          </div>

          <div className="disclaimer-callout">
            <Info size={16} className="icon-amber" />
            <span>
              <strong>Disclaimer:</strong> WeatherGPT provides AI-assisted decision support. For emergency evacuation or disaster protocols, always adhere to official local disaster management authorities.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
