import React from 'react';

interface PerformanceHUDProps {
  fps: number;
  isModelLoaded: boolean;
  handCount: number;
  lastCoordinates: { x: number; y: number } | null;
  activeGesture: string;
}

export const PerformanceHUD: React.FC<PerformanceHUDProps> = ({
  fps,
  isModelLoaded,
  handCount,
  lastCoordinates,
  activeGesture
}) => {
  return (
    <div className="stats-panel glass-panel">
      <h3 style={{ 
        fontFamily: 'var(--font-neon)', 
        fontSize: '0.85rem', 
        letterSpacing: '1px', 
        marginBottom: '0.5rem',
        color: 'var(--accent-secondary)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        SYSTEM HUD / SİSTEM VERİLERİ
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="stat-row">
          <span className="stat-label">Model Status:</span>
          <span className="stat-value" style={{ color: isModelLoaded ? 'var(--accent-primary)' : '#ff3333' }}>
            {isModelLoaded ? 'ACTIVE / AKTİF' : 'LOADING / YÜKLENİYOR'}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Webcam FPS:</span>
          <span className="stat-value">{fps} FPS</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Hands Tracked:</span>
          <span className="stat-value">{handCount} / 2</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Active Gesture:</span>
          <span className="stat-value" style={{ textTransform: 'uppercase' }}>
            {activeGesture || 'NONE'}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">X / Y Coord:</span>
          <span className="stat-value">
            {lastCoordinates 
              ? `${Math.round(lastCoordinates.x)}, ${Math.round(lastCoordinates.y)}` 
              : 'OFFSCREEN'}
          </span>
        </div>
      </div>
    </div>
  );
};
