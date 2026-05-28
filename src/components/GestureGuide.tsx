import React from 'react';
import type { GestureType } from '../utils/handTracker';

interface GestureGuideProps {
  activeGesture: GestureType;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({ activeGesture }) => {
  const gestures = [
    {
      id: 'point' as GestureType,
      name: 'Point to Draw',
      action: 'Extend index finger only',
      icon: '👆',
      turkishName: 'İşaret Et (Çiz)',
      turkishAction: 'Yalnızca işaret parmağını uzat'
    },
    {
      id: 'open_palm' as GestureType,
      name: 'Open Palm to Erase',
      action: 'Extend all fingers',
      icon: '🖐️',
      turkishName: 'Açık Avuç (Sil)',
      turkishAction: 'Tüm parmakları açarak sil'
    },
    {
      id: 'peace' as GestureType,
      name: 'Peace to Cycle Theme',
      action: 'V gesture with 2 fingers',
      icon: '✌️',
      turkishName: 'Zafer (Tema Değiştir)',
      turkishAction: 'İşaret ve orta parmağı uzat'
    }
  ];

  return (
    <div className="gesture-guide-panel glass-panel">
      <h3 style={{ 
        fontFamily: 'var(--font-neon)', 
        fontSize: '0.85rem', 
        letterSpacing: '1px', 
        marginBottom: '0.5rem',
        color: 'var(--accent-primary)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        SPATIAL GESTURES / HAREKETLER
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {gestures.map((gesture) => {
          const isActive = activeGesture === gesture.id;
          return (
            <div 
              key={gesture.id} 
              className={`gesture-item ${isActive ? 'active' : ''}`}
            >
              <div className="gesture-icon">
                {gesture.icon}
              </div>
              <div className="gesture-details">
                <span className="gesture-name" style={{ color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)' }}>
                  {gesture.turkishName}
                </span>
                <span className="gesture-action" style={{ color: isActive ? 'rgba(0,0,0,0.6)' : 'var(--text-secondary)' }}>
                  {gesture.turkishAction}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
