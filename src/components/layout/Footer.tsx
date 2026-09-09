import React from 'react';
import { ShieldCheck, Database, Info, ShieldAlert, Lock } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & SIH Info */}
          <div className="footer-col brand-col">
            <h4 className="footer-title">
              Weather<span className="brand-accent">GPT</span>
            </h4>
            <p className="footer-tagline-text" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, margin: '0.2rem 0 0.5rem 0' }}>
              FROM WEATHER DATA TO BETTER DECISIONS
            </p>
            <p className="footer-desc">
              An evidence-grounded conversational weather intelligence platform that combines real weather data, forecasts, warnings and climate information to help users make better weather-related decisions.
            </p>
            <div className="sih-badge">
              <ShieldCheck size={16} className="sih-icon" />
              <span>WeatherGPT Intelligence Platform</span>
            </div>
          </div>

          {/* Data Sources (Requirement 55) */}
          <div className="footer-col">
            <h5 className="footer-subtitle">Actual Data Providers</h5>
            <ul className="footer-list" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              <li className="status-item" style={{ marginBottom: '0.4rem' }}>
                <Database size={14} className="icon-cyan" />
                <span>Forecast: <strong>Open-Meteo API</strong></span>
              </li>
              <li className="status-item" style={{ marginBottom: '0.4rem' }}>
                <ShieldAlert size={14} className="icon-amber" />
                <span>Alerts: <strong>Official IMD / NDMA Feed</strong></span>
              </li>
              <li className="status-item" style={{ marginBottom: '0.4rem' }}>
                <Database size={14} className="icon-emerald" />
                <span>Climate: <strong>Open-Meteo ERA5 Archive</strong></span>
              </li>
            </ul>
          </div>

          {/* Privacy & Safety Notes (Requirement 56, 57 & 58) */}
          <div className="footer-col">
            <h5 className="footer-subtitle">Privacy &amp; Safety Notice</h5>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <Lock size={14} className="icon-cyan" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Privacy:</strong> Your browser location is used solely to provide location-specific weather telemetry.</span>
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <Info size={14} className="icon-amber" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Decision Support:</strong> WeatherGPT is a decision-support platform and does not replace official emergency authorities.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner (Requirement 57) */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '1rem' }}>
          <p className="disclaimer-text" style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
            ⚠️ Disclaimer: Weather conditions can change rapidly. WeatherGPT provides forecast-based decision support. For severe weather and emergencies, follow official government and meteorological authorities.
          </p>
        </div>
      </div>
    </footer>
  );
};
