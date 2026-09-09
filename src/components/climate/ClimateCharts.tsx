import React, { useState } from 'react';
import { ClimateComparisonResult } from '../../services/historicalWeatherService';
import './ClimateCharts.css';

interface ClimateChartsProps {
  data: ClimateComparisonResult;
}

export const ClimateCharts: React.FC<ClimateChartsProps> = ({ data }) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    value: string;
  } | null>(null);

  const points = data.trendData || [];
  if (!data.isAvailable || points.length === 0) {
    return (
      <div className="climate-charts-container">
        <div className="glass-card empty-chart-notice" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Historical weather data is not available for this location or period.</p>
        </div>
      </div>
    );
  }

  const validTemps = points.map((p) => p.avgTemp).filter((v): v is number => v !== null);
  const validMaxs = points.map((p) => p.maxTemp).filter((v): v is number => v !== null);
  const validMins = points.map((p) => p.minTemp).filter((v): v is number => v !== null);
  const validRains = points.map((p) => p.precipitation).filter((v): v is number => v !== null);

  const maxTemp = validMaxs.length > 0 ? Math.max(...validMaxs, 40) : 40;
  const minTemp = validMins.length > 0 ? Math.min(...validMins, 10) : 10;
  const maxRain = validRains.length > 0 ? Math.max(...validRains, 20) : 20;

  const width = 600;
  const height = 190;
  const padding = 30;

  // Temperature Polyline Calculation
  const tempSvgPoints = points
    .map((p, i) => {
      if (p.avgTemp === null) return null;
      const x = padding + (i / (points.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((p.avgTemp - minTemp) / (maxTemp - minTemp || 1)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .filter((pt): pt is string => pt !== null)
    .join(' ');

  const baselineY = data.baselineAvgTemp !== null
    ? height - padding - ((data.baselineAvgTemp - minTemp) / (maxTemp - minTemp || 1)) * (height - padding * 2)
    : null;

  return (
    <div className="climate-charts-container">
      {/* 1. Temperature Trend Chart */}
      <div className="chart-box glass-card">
        <div className="chart-header">
          <h4 className="chart-title">🌡️ Temperature Trend</h4>
          <span className="badge badge-ai">{data.tempDiffLabel}</span>
        </div>

        <div className="svg-chart-wrapper" style={{ position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg">
            {/* Horizontal Grid */}
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            {/* Baseline Line if available */}
            {baselineY !== null && (
              <line x1={padding} y1={baselineY} x2={width - padding} y2={baselineY} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth="1.5" />
            )}

            {/* Temperature Line */}
            {tempSvgPoints && (
              <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={tempSvgPoints} />
            )}

            {/* Point Markers with Tooltips (Req 35) */}
            {points.map((p, i) => {
              if (p.avgTemp === null) return null;
              const x = padding + (i / (points.length - 1 || 1)) * (width - padding * 2);
              const y = height - padding - ((p.avgTemp - minTemp) / (maxTemp - minTemp || 1)) * (height - padding * 2);

              const isStepPoint = i % Math.max(1, Math.ceil(points.length / 8)) === 0 || i === points.length - 1;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#38bdf8"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x,
                        y,
                        title: p.date,
                        value: `Temperature: ${p.avgTemp}°C (High: ${p.maxTemp ?? 'N/A'}°C, Low: ${p.minTemp ?? 'N/A'}°C)`
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                  {isStepPoint && (
                    <text x={x} y={y - 8} fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {p.avgTemp}°C
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="chart-legend">
          <span className="legend-item"><span className="dot temp-dot"></span> Observed Mean Temp</span>
          {data.baselineAvgTemp !== null && (
            <span className="legend-item"><span className="line baseline-line"></span> Historical Baseline ({data.baselineAvgTemp}°C)</span>
          )}
        </div>
      </div>

      {/* 2. Rainfall Trend Chart (Requirement 15) */}
      <div className="chart-box glass-card">
        <div className="chart-header">
          <h4 className="chart-title">🌧️ Rainfall Trend (mm)</h4>
          <span className="badge badge-cyan">{data.rainDiffLabel}</span>
        </div>

        {validRains.length === 0 ? (
          <div className="no-rain-data-box" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Rainfall history is unavailable.</p>
          </div>
        ) : (
          <>
            <div className="svg-chart-wrapper">
              <svg viewBox={`0 0 ${width} ${height}`} className="responsive-svg">
                {points.map((p, i) => {
                  if (p.precipitation === null) return null;
                  const barWidth = Math.max(3, (width - padding * 2) / points.length - 2);
                  const x = padding + (i / (points.length || 1)) * (width - padding * 2);
                  const barHeight = ((p.precipitation) / (maxRain || 1)) * (height - padding * 2);
                  const y = height - padding - barHeight;

                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      fill={p.precipitation > 15 ? '#38bdf8' : p.precipitation > 0 ? '#0284c7' : 'rgba(255,255,255,0.05)'}
                      rx="2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() =>
                        setActiveTooltip({
                          x,
                          y: y - 5,
                          title: p.date,
                          value: `Rainfall: ${p.precipitation} mm`
                        })
                      }
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="chart-summary-row">
              <span>Observed Total: <strong>{data.currentTotalRain ?? 'N/A'} mm</strong></span>
              <span>Historical Baseline: <strong>{data.baselineTotalRain ?? 'N/A'} mm</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Tooltip Overlay */}
      {activeTooltip && (
        <div
          className="chart-tooltip-bubble"
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9999,
            background: '#0f172a',
            border: '1px solid #38bdf8',
            color: '#ffffff',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            top: activeTooltip.y + 100,
            left: activeTooltip.x + 50
          }}
        >
          <div style={{ fontWeight: 700, color: '#38bdf8' }}>{activeTooltip.title}</div>
          <div>{activeTooltip.value}</div>
        </div>
      )}
    </div>
  );
};

