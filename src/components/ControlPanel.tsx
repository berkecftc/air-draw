import React, { useState } from 'react';
import { 
  Paintbrush, 
  Eraser, 
  Trash2, 
  Undo2, 
  Redo2, 
  Download, 
  Layers, 
  Settings, 
  Sparkles,
  HelpCircle,
  Video,
  VideoOff
} from 'lucide-react';

export type BrushStyle = 'solid' | 'glow' | 'calligraphy' | 'rainbow';
export type ToolMode = 'draw' | 'erase';
export type AppTheme = 'neon' | 'gold' | 'ocean';
interface ControlPanelProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushStyle: BrushStyle;
  setBrushStyle: (style: BrushStyle) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  showSkeleton: boolean;
  setShowSkeleton: (show: boolean) => void;
  showWebcam: boolean;
  setShowWebcam: (show: boolean) => void;
  isMirrored: boolean;
  setIsMirrored: (mirror: boolean) => void;
  activeTheme: AppTheme;
  setActiveTheme: (theme: AppTheme) => void;
  
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  brushStyle,
  setBrushStyle,
  toolMode,
  setToolMode,
  showSkeleton,
  setShowSkeleton,
  showWebcam,
  setShowWebcam,
  isMirrored,
  setIsMirrored,
  activeTheme,
  setActiveTheme,
  
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const colors = [
    { value: '#ff007f', name: 'Hot Pink' },
    { value: '#00f0ff', name: 'Electric Cyan' },
    { value: '#ffaa00', name: 'Cyber Gold' },
    { value: '#39ff14', name: 'Lime Green' },
    { value: '#aa3bff', name: 'Neon Purple' },
    { value: '#ffffff', name: 'Pure White' }
  ];

  const themes = [
    { id: 'neon' as AppTheme, name: 'Neon Dark', accent: '#ff007f' },
    { id: 'gold' as AppTheme, name: 'Cyber Gold', accent: '#ffaa00' },
    { id: 'ocean' as AppTheme, name: 'Deep Ocean', accent: '#00f5d4' }
  ];

  return (
    <>
      <div className="control-dock glass-panel">
        {/* Undo / Redo / Clear Actions */}
        <div className="control-group">
          <button 
            className="hud-btn hud-btn-circle" 
            onClick={onUndo} 
            disabled={!canUndo}
            data-tooltip="Geri Al (Undo)"
            style={{ opacity: canUndo ? 1 : 0.4 }}
          >
            <Undo2 size={18} />
          </button>
          <button 
            className="hud-btn hud-btn-circle" 
            onClick={onRedo} 
            disabled={!canRedo}
            data-tooltip="İleri Al (Redo)"
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            <Redo2 size={18} />
          </button>
          <button 
            className="hud-btn hud-btn-circle" 
            onClick={onClear} 
            data-tooltip="Temizle (Clear)"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Brush Mode & Eraser Toggle */}
        <div className="control-group">
          <button 
            className={`hud-btn hud-btn-circle ${toolMode === 'draw' ? 'active' : ''}`}
            onClick={() => setToolMode('draw')}
            data-tooltip="Çizim Aracı (Brush)"
          >
            <Paintbrush size={18} />
          </button>
          <button 
            className={`hud-btn hud-btn-circle ${toolMode === 'erase' ? 'active' : ''}`}
            onClick={() => setToolMode('erase')}
            data-tooltip="Silgi (Eraser)"
          >
            <Eraser size={18} />
          </button>
        </div>

        {/* Color Palette (Disabled in eraser mode, hidden or grayed out) */}
        <div className="control-group" style={{ opacity: toolMode === 'erase' ? 0.3 : 1, pointerEvents: toolMode === 'erase' ? 'none' : 'auto' }}>
          {colors.map((color) => (
            <button
              key={color.value}
              className={`color-dot ${brushColor === color.value && brushStyle !== 'rainbow' ? 'active' : ''}`}
              style={{ backgroundColor: color.value, color: color.value }}
              onClick={() => {
                setBrushColor(color.value);
                if (brushStyle === 'rainbow') setBrushStyle('solid'); // switch away from rainbow
              }}
              title={color.name}
            />
          ))}
          {/* Rainbow brush toggle button */}
          <button
            className={`hud-btn hud-btn-circle ${brushStyle === 'rainbow' ? 'active' : ''}`}
            onClick={() => setBrushStyle('rainbow')}
            data-tooltip="Gökkuşağı Efekti (Rainbow)"
            style={{ 
              background: 'linear-gradient(45deg, #ff007f, #00f0ff, #ffaa00, #39ff14)',
              border: brushStyle === 'rainbow' ? '2px solid var(--text-primary)' : '1px solid transparent'
            }}
          >
            <Sparkles size={16} color={brushStyle === 'rainbow' ? '#000' : '#fff'} />
          </button>
        </div>

        {/* Brush style controls */}
        <div className="control-group" style={{ opacity: toolMode === 'erase' ? 0.3 : 1, pointerEvents: toolMode === 'erase' ? 'none' : 'auto' }}>
          <select 
            value={brushStyle} 
            onChange={(e) => setBrushStyle(e.target.value as BrushStyle)}
            className="hud-btn"
            style={{ height: '42px', paddingRight: '1.5rem', cursor: 'pointer' }}
          >
            <option value="solid">Düz Fırça (Solid)</option>
            <option value="glow">Neon Işıltı (Glow)</option>
            <option value="calligraphy">Kaligrafi (Chisel)</option>
          </select>
        </div>

        {/* Brush Size Slider */}
        <div className="control-group">
          <div className="slider-container">
            <div className="slider-label">
              <span>Boyut</span>
              <span>{brushSize}px</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="60" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
              className="hud-slider"
            />
          </div>
        </div>

        {/* Camera / Skeleton View Toggles */}
        <div className="control-group">
          <button 
            className={`hud-btn hud-btn-circle ${showWebcam ? 'active' : ''}`}
            onClick={() => setShowWebcam(!showWebcam)}
            data-tooltip={showWebcam ? "Kamerayı Gizle" : "Kamerayı Göster"}
          >
            {showWebcam ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button 
            className={`hud-btn hud-btn-circle ${showSkeleton ? 'active' : ''}`}
            onClick={() => setShowSkeleton(!showSkeleton)}
            data-tooltip="El İskeletini Göster/Gizle"
          >
            <Layers size={18} />
          </button>
        </div>

        {/* Extra Settings & Save */}
        <div className="control-group">
          <button 
            className="hud-btn hud-btn-circle" 
            onClick={() => setShowSettingsModal(true)}
            data-tooltip="Ayarlar (Settings)"
          >
            <Settings size={18} />
          </button>
          <button 
            className="hud-btn" 
            onClick={onSave}
            data-tooltip="Çizimi İndir (PNG)"
          >
            <Download size={18} />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Overlay panel) */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">SPATIAL SETTINGS / AYARLAR</div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Dynamic Theme Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Arayüz Teması / UI Theme</span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`hud-btn ${activeTheme === theme.id ? 'active' : ''}`}
                      style={{ flex: 1, textTransform: 'uppercase' }}
                      onClick={() => setActiveTheme(theme.id)}
                    >
                      <span style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: theme.accent, 
                        display: 'inline-block',
                        marginRight: '6px'
                      }} />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Mirroring Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Kamera Görüntüsünü Aynala / Mirror Video</span>
                <button
                  className={`hud-btn ${isMirrored ? 'active' : ''}`}
                  onClick={() => setIsMirrored(!isMirrored)}
                >
                  {isMirrored ? 'AKTİF / ACTIVE' : 'PASİF / INACTIVE'}
                </button>
              </div>

              {/* Tutorial Info */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <HelpCircle size={32} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>Nasıl Kullanılır:</strong> Kamera izinlerini onayladıktan sonra elinizi kameraya gösterin. Sistem elinizi tanıdıktan sonra seçili fırçayla çizime başlayabilirsiniz. Sol taraftaki rehbere göre el hareketlerinizi değiştirerek fırça ve silgi arasında geçiş yapabilirsiniz.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="hud-btn active" onClick={() => setShowSettingsModal(false)}>
                Kapat (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
