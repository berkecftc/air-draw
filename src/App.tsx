import { useEffect, useRef, useState } from 'react';
import { handTracker } from './utils/handTracker';
import type { GestureType, Point3D } from './utils/handTracker';
import { ControlPanel } from './components/ControlPanel';
import type { BrushStyle, ToolMode, AppTheme } from './components/ControlPanel';
import { GestureGuide } from './components/GestureGuide';
import { PerformanceHUD } from './components/PerformanceHUD';

export default function App() {
  // Brush Config State
  const [brushSize, setBrushSize] = useState<number>(8);
  const [brushColor, setBrushColor] = useState<string>('#ff007f');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('glow');
  const [toolMode, setToolMode] = useState<ToolMode>('draw');

  // Canvas / Video Overlay Config State
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showWebcam, setShowWebcam] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [activeTheme, setActiveTheme] = useState<AppTheme>('neon');

  // System Stats HUD State
  const [fps, setFps] = useState<number>(0);
  const [handCount, setHandCount] = useState<number>(0);
  const [activeGesture, setActiveGesture] = useState<GestureType>('unknown');
  const [lastCoordinates, setLastCoordinates] = useState<{ x: number; y: number } | null>(null);

  // Model & Camera Loader State
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing systems...');
  const [cameraError, setCameraError] = useState<string>('');

  // Refs for HTML Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const skeletonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Refs for drawing logic variables (persisting without triggering React re-renders)
  const isDrawingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);
  const prevYRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastThemeChangeRef = useRef<number>(0);
  const rainbowHueRef = useRef<number>(0);

  // Undo/Redo Refs & enabling states
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Apply active theme class to document body
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
  }, [activeTheme]);

  // Start initialization on mount
  useEffect(() => {
    let active = true;

    const setupApp = async () => {
      try {
        // 1. Request camera stream first
        if (active) setLoadingStatus('Requesting webcam access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 2. Initialize Hand Tracker
        await handTracker.initialize((status) => {
          if (active) setLoadingStatus(status);
        });

        if (active) {
          setIsModelLoaded(true);
          setLoadingStatus('Ready');
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Camera access denied. Please grant permission in your browser settings to use this app.');
          } else {
            setCameraError('Could not start webcam. Please verify your camera is connected and not in use by another app.');
          }
          setLoadingStatus('Error starting system');
        }
      }
    };

    setupApp();

    return () => {
      active = false;
      // Cleanup video streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Save current canvas state to Undo Stack
  const saveStateToUndo = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imgData);

    // Limit history stack size to 25 items to prevent out-of-memory errors
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }

    // Reset Redo stack on new drawing action
    redoStackRef.current = [];
    
    setCanUndo(true);
    setCanRedo(false);
  };

  const handleUndo = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Push current canvas state to Redo Stack before restoring
    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStackRef.current.push(currentImg);

    const prevState = undoStackRef.current.pop();
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
    }

    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || redoStackRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Push current canvas state to Undo Stack before restoring
    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(currentImg);

    const nextState = redoStackRef.current.pop();
    if (nextState) {
      ctx.putImageData(nextState, 0, 0);
    }

    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const handleClear = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveStateToUndo();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    // Save as transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `air-drawing-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Main Tracking Loop
  useEffect(() => {
    if (!isModelLoaded) return;

    const video = videoRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const skeletonCanvas = skeletonCanvasRef.current;

    if (!video || !drawingCanvas || !skeletonCanvas) return;

    const drawCtx = drawingCanvas.getContext('2d');
    const skelCtx = skeletonCanvas.getContext('2d');

    if (!drawCtx || !skelCtx) return;

    // Resizing function (preserves contents)
    const resizeIfNeeded = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const w = video.videoWidth;
        const h = video.videoHeight;

        if (skeletonCanvas.width !== w || skeletonCanvas.height !== h) {
          skeletonCanvas.width = w;
          skeletonCanvas.height = h;
        }

        if (drawingCanvas.width !== w || drawingCanvas.height !== h) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = drawingCanvas.width;
          tempCanvas.height = drawingCanvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx && drawingCanvas.width > 0 && drawingCanvas.height > 0) {
            tempCtx.drawImage(drawingCanvas, 0, 0);
          }

          drawingCanvas.width = w;
          drawingCanvas.height = h;

          if (tempCanvas.width > 0 && tempCanvas.height > 0) {
            drawCtx.drawImage(tempCanvas, 0, 0, w, h);
          }
        }
      }
    };

    // FPS counter helper variables
    let lastFpsUpdate = performance.now();
    let frameCount = 0;

    const renderLoop = () => {
      // 1. Compute FPS
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // 2. Adjust canvas aspect ratio to webcam if needed
      resizeIfNeeded();

      // 3. Clear skeleton canvas
      skelCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);

      // 4. Run hand detection on the current video frame
      if (video.readyState >= 2) {
        const timestamp = performance.now();
        const trackingResult = handTracker.detectVideoFrame(video, timestamp);

        if (trackingResult && trackingResult.landmarks && trackingResult.landmarks.length > 0) {
          setHandCount(trackingResult.landmarks.length);

          // Process the primary hand (index 0)
          const primaryHandLandmarks = trackingResult.landmarks[0] as Point3D[];
          const gesture = handTracker.detectGesture(primaryHandLandmarks);
          setActiveGesture(gesture);

          // Get index finger tip coordinates (Landmark 8)
          const indexTip = primaryHandLandmarks[8];
          const canvasWidth = drawingCanvas.width;
          const canvasHeight = drawingCanvas.height;

          // Mirror calculation
          const mappedX = isMirrored ? (1 - indexTip.x) * canvasWidth : indexTip.x * canvasWidth;
          const mappedY = indexTip.y * canvasHeight;

          setLastCoordinates({ x: mappedX, y: mappedY });

          // Draw the hand skeleton if enabled
          if (showSkeleton) {
            // Pick color based on active theme
            let skeletonColor = '#ff007f';
            if (activeTheme === 'gold') skeletonColor = '#ffaa00';
            else if (activeTheme === 'ocean') skeletonColor = '#00f5d4';

            // Draw skeleton lines and points
            drawHandSkeleton(skelCtx, primaryHandLandmarks, isMirrored, skeletonColor);
          }

          // Cycle theme gesture (Peace / V gesture)
          if (gesture === 'peace') {
            const timeSinceLastChange = now - lastThemeChangeRef.current;
            if (timeSinceLastChange > 1500) { // 1.5s cooldown
              lastThemeChangeRef.current = now;
              setActiveTheme((prevTheme) => {
                if (prevTheme === 'neon') return 'gold';
                if (prevTheme === 'gold') return 'ocean';
                return 'neon';
              });
            }
          }

          // Drawing gesture logic (index finger point only)
          const isDrawingGesture = gesture === 'point';

          // Erasing gesture logic (open palm)
          const isErasingGesture = gesture === 'open_palm';

          if (isDrawingGesture && toolMode === 'draw') {
            // Perform drawing
            drawCtx.save();
            drawCtx.lineCap = 'round';
            drawCtx.lineJoin = 'round';

            // Rainbow fırça color mapping
            if (brushStyle === 'rainbow') {
              rainbowHueRef.current = (rainbowHueRef.current + 2) % 360;
              drawCtx.strokeStyle = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
            } else {
              drawCtx.strokeStyle = brushColor;
            }

            // Glow brush shadows
            if (brushStyle === 'glow') {
              drawCtx.shadowBlur = brushSize * 1.3;
              drawCtx.shadowColor = brushColor;
            } else {
              drawCtx.shadowBlur = 0;
            }

            // Drawing line from previous coordinates
            if (isDrawingRef.current && prevXRef.current !== null && prevYRef.current !== null) {
              // Smooth out coordinate noise using EMA
              const alpha = 0.45;
              const smoothX = prevXRef.current * (1 - alpha) + mappedX * alpha;
              const smoothY = prevYRef.current * (1 - alpha) + mappedY * alpha;

              // Calligraphy fırça variable width based on velocity
              if (brushStyle === 'calligraphy') {
                const dist = Math.sqrt(Math.pow(smoothX - prevXRef.current, 2) + Math.pow(smoothY - prevYRef.current, 2));
                const speed = Math.min(dist, 40); 
                drawCtx.lineWidth = brushSize * (1.2 - (speed / 40) * 0.9);
              } else {
                drawCtx.lineWidth = brushSize;
              }

              drawCtx.beginPath();
              drawCtx.moveTo(prevXRef.current, prevYRef.current);
              drawCtx.lineTo(smoothX, smoothY);
              drawCtx.stroke();

              prevXRef.current = smoothX;
              prevYRef.current = smoothY;
            } else {
              // First coordinate of stroke, start drawing
              saveStateToUndo();
              prevXRef.current = mappedX;
              prevYRef.current = mappedY;
              isDrawingRef.current = true;
            }
            drawCtx.restore();

            // Draw brush feedback cursor ring on skeleton canvas
            drawBrushIndicator(skelCtx, mappedX, mappedY, brushSize, brushStyle === 'rainbow' ? `hsl(${rainbowHueRef.current}, 100%, 50%)` : brushColor, true);

          } else if (isErasingGesture || (toolMode === 'erase' && isDrawingGesture)) {
            // Perform blackboard-style erasing
            // If fist is active, we erase at Middle MCP joint (landmark 9) which is center of fist
            // Otherwise, we erase at index tip
            const erasePoint = isErasingGesture ? primaryHandLandmarks[9] : indexTip;
            const eraseX = isMirrored ? (1 - erasePoint.x) * canvasWidth : erasePoint.x * canvasWidth;
            const eraseY = erasePoint.y * canvasHeight;

            drawCtx.save();
            drawCtx.globalCompositeOperation = 'destination-out';
            drawCtx.lineCap = 'round';
            drawCtx.lineJoin = 'round';
            
            // Fist erase has a larger, circular eraser radius
            const eraseSize = brushSize * (isErasingGesture ? 4.0 : 2.5);
            drawCtx.lineWidth = eraseSize;

            if (isDrawingRef.current && prevXRef.current !== null && prevYRef.current !== null) {
              const alpha = 0.45;
              const smoothX = prevXRef.current * (1 - alpha) + eraseX * alpha;
              const smoothY = prevYRef.current * (1 - alpha) + eraseY * alpha;

              drawCtx.beginPath();
              drawCtx.moveTo(prevXRef.current, prevYRef.current);
              drawCtx.lineTo(smoothX, smoothY);
              drawCtx.stroke();

              prevXRef.current = smoothX;
              prevYRef.current = smoothY;
            } else {
              saveStateToUndo();
              prevXRef.current = eraseX;
              prevYRef.current = eraseY;
              isDrawingRef.current = true;
            }
            drawCtx.restore();

            // Draw circular eraser feedback indicator on skeleton canvas
            drawEraserIndicator(skelCtx, eraseX, eraseY, eraseSize);

          } else {
            // If hand is in view but not performing draw/erase gestures, reset drawing state
            isDrawingRef.current = false;
            prevXRef.current = null;
            prevYRef.current = null;

            // Still draw a hover brush cursor so user knows where their hand is pointing
            drawBrushIndicator(skelCtx, mappedX, mappedY, brushSize, brushStyle === 'rainbow' ? `hsl(${rainbowHueRef.current}, 100%, 50%)` : brushColor, false);
          }

        } else {
          // No hand detected
          setHandCount(0);
          setActiveGesture('unknown');
          setLastCoordinates(null);
          isDrawingRef.current = false;
          prevXRef.current = null;
          prevYRef.current = null;
        }
      }

      // Continue animation loop
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isModelLoaded, brushColor, brushSize, brushStyle, toolMode, showSkeleton, isMirrored]);

  // Canvas drawing helpers
  const drawHandSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: Point3D[],
    isMirrored: boolean,
    color: string
  ) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const getCanvasCoord = (pt: Point3D) => {
      return {
        x: isMirrored ? (1 - pt.x) * canvasWidth : pt.x * canvasWidth,
        y: pt.y * canvasHeight
      };
    };

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm Base
    ];

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    
    connections.forEach(([i1, i2]) => {
      const p1 = getCanvasCoord(landmarks[i1]);
      const p2 = getCanvasCoord(landmarks[i2]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
    landmarks.forEach((pt, index) => {
      const { x, y } = getCanvasCoord(pt);
      ctx.beginPath();
      ctx.arc(x, y, index === 4 || index === 8 ? 7 : 5, 0, 2 * Math.PI);
      if (index === 4 || index === 8) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
    });
    ctx.restore();
  };

  const drawBrushIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    isDrawing: boolean
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + (isDrawing ? 4 : 10), 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = isDrawing ? 3 : 1.5;
    ctx.shadowBlur = isDrawing ? 8 : 4;
    ctx.shadowColor = color;
    if (!isDrawing) {
      ctx.setLineDash([4, 4]);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  };

  const drawEraserIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.stroke();

    // Small interior eraser text or label
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 10px var(--font-neon)';
    ctx.textAlign = 'center';
    ctx.fillText('ERASER', x, y + 3);
    ctx.restore();
  };

  return (
    <div className="canvas-stage">
      {/* Ambient background glows */}
      <div className="ambient-glow" />
      <div className="ambient-glow-left" />

      {/* Background HTML5 Video Feed (Style hidden or mirrored) */}
      <video
        ref={videoRef}
        className={`webcam-video ${isMirrored ? 'mirrored' : ''}`}
        autoPlay
        playsInline
        muted
        style={{
          display: showWebcam ? 'block' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          opacity: 0.18, // subtle, premium overlay
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Layer 1: Persistent drawing canvas */}
      <canvas
        ref={drawingCanvasRef}
        className="canvas-layer"
        style={{ zIndex: 2 }}
      />

      {/* Layer 2: Fast-clearing hand skeleton canvas */}
      <canvas
        ref={skeletonCanvasRef}
        className="canvas-layer"
        style={{ zIndex: 3 }}
      />

      {/* 3. Futuristic Heads Up Display (HUD) & Branding */}
      <header className="header-hud" style={{ zIndex: 10 }}>
        <div className="brand-section">
          <div className="pulse-indicator" />
          <h1 className="brand-title">NEON AIR DRAW</h1>
          <span className="brand-badge">SPATIAL V1.0</span>
        </div>
      </header>

      {/* Interactive Overlays */}
      <div className="ui-container" style={{ width: '100vw', height: '100vh', top: 0, left: 0, zIndex: 10 }}>
        
        {/* Floating gesture guide on the left */}
        <GestureGuide activeGesture={activeGesture} />

        {/* Floating stats monitor on the right */}
        <PerformanceHUD
          fps={fps}
          isModelLoaded={isModelLoaded}
          handCount={handCount}
          lastCoordinates={lastCoordinates}
          activeGesture={activeGesture}
        />

        {/* Floating controls panel on the bottom */}
        <ControlPanel
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushStyle={brushStyle}
          setBrushStyle={setBrushStyle}
          toolMode={toolMode}
          setToolMode={setToolMode}
          showSkeleton={showSkeleton}
          setShowSkeleton={setShowSkeleton}
          showWebcam={showWebcam}
          setShowWebcam={setShowWebcam}
          isMirrored={isMirrored}
          setIsMirrored={setIsMirrored}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onSave={handleSave}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Fullscreen Loader screen during startup */}
      {(!isModelLoaded || cameraError) && (
        <div className="loader-overlay" style={{ zIndex: 100 }}>
          <div className="loader-logo neon-text-glow" style={{ color: 'var(--accent-primary)' }}>
            NEON AIR DRAW
          </div>
          
          {cameraError ? (
            <div className="glass-panel" style={{ maxWidth: '400px', padding: '2rem', border: '1px solid #ff3333' }}>
              <h4 style={{ color: '#ff3333', marginBottom: '1rem', fontFamily: 'var(--font-neon)' }}>CAMERA ERROR</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{cameraError}</p>
              <button 
                className="hud-btn active" 
                style={{ marginTop: '1.5rem', width: '100%', background: '#ff3333', borderColor: '#ff3333' }}
                onClick={() => window.location.reload()}
              >
                Yeniden Dene / Retry
              </button>
            </div>
          ) : (
            <>
              <div className="loader-spinner-container">
                <div className="loader-spinner" />
                <div className="loader-progress">AI</div>
              </div>
              <div className="loader-status">
                {loadingStatus}
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  İlk yüklemede kütüphanelerin inmesi birkaç saniye sürebilir...
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
