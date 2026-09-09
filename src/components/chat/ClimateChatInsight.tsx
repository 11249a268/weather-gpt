import React from 'react';
import { BarChart3, MapPin, Calendar, Database, Sparkles, TrendingUp, Info } from 'lucide-react';
import { ClimateGPTResult } from '../../services/explanationService';
import './ClimateChatInsight.css';

interface ClimateChatInsightProps {
  result: ClimateGPTResult;
}

export const ClimateChatInsight: React.FC<ClimateChatInsightProps> = ({ result }) => {
  return (
    <div className="climate-chat-insight-card glass-card">
      <div className="insight-card-header">
        <div className="header-left">
          <div className="insight-icon-box">
            <BarChart3 size={18} className="icon-cyan" />
            <Sparkles size={10} className="sparkle-badge" />
          </div>
          <div>
            <h4 className="insight-card-title">📊 Climate Insight</h4>
            <span className="insight-card-subtitle">{result.metricLabel} Baseline Comparison</span>
          </div>
        </div>

        <div className="location-chip">
          <MapPin size={12} className="icon-cyan" />
          <span>{result.secondaryLocationName ? `${result.locationName} vs ${result.secondaryLocationName}` : result.locationName}</span>
        </div>
      </div>

      <div className="insight-grid">
        <div className="grid-item">
          <span className="item-label">Period</span>
          <span className="item-value">{result.periodLabel}</span>
        </div>

        <div className="grid-item">
          <span className="item-label">Metric</span>
          <span className="item-value">{result.metricLabel}</span>
        </div>

        <div className="grid-item highlight-item">
          <span className="item-label">Observed Current</span>
          <span className="item-value current-val">{result.currentValue}</span>
        </div>

        <div className="grid-item">
          <span className="item-label">Historical Baseline</span>
          <span className="item-value">{result.baselineValue}</span>
        </div>

        <div className="grid-item highlight-item">
          <span className="item-label">Difference / Anomaly</span>
          <span className="item-value diff-val">{result.differenceValue}</span>
        </div>
      </div>

      <div className="insight-summary-block">
        <div className="summary-label">
          <TrendingUp size={14} className="icon-amber" />
          <span>Calculated Insight</span>
        </div>
        <p className="summary-text">{result.insightSummary}</p>
      </div>

      <div className="insight-footer">
        <div className="source-row">
          <Database size={12} className="icon-cyan" />
          <span>Source: <strong>{result.dataSource}</strong></span>
        </div>
        <div className="disclaimer-badge">
          <Info size={11} />
          <span>Evidence Grounded</span>
        </div>
      </div>
    </div>
  );
};
