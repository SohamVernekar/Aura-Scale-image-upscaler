import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers, HelpCircle } from 'lucide-react';

export default function ComparisonSlider({ originalImage, processedImage, details }) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Check if original and processed images are the same (mock mode for custom uploads)
  const isMockCustomUpload = originalImage === processedImage;

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    
    // Boundary checks
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    setSliderPosition(position);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  return (
    <div className="w-full flex flex-col items-center space-y-5">
      {/* Visual Workspace Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="w-full relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-[#080b11] select-none cursor-ew-resize max-h-[580px] shadow-2xl"
      >
        {/* Subtle grid background to highlight transparent parts or image boundaries */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        {/* 1. After Image (Background) */}
        <img
          src={processedImage}
          alt="Enhanced Output"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable="false"
        />

        {/* 2. Before Image (Foreground, Clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalImage}
            alt="Original Input"
            // Apply a visual blur filter only if it's a custom upload mock to showcase "restoration"
            className={`w-full h-full object-contain pointer-events-none select-none ${
              isMockCustomUpload ? 'blur-[1.8px] contrast-[0.93] saturate-[0.9]' : ''
            }`}
            draggable="false"
          />
        </div>

        {/* Before / After Label Badges */}
        <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md text-slate-400 z-30 pointer-events-none">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-violet-950/85 border border-violet-850 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md text-violet-300 z-30 pointer-events-none">
          After
        </div>

        {/* Interactive Curtain Divider Bar */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-500 via-cyan-400 to-violet-500 z-40"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Central Handle Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-slate-100 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform duration-200 group hover:scale-110 active:scale-95">
            <div className="flex gap-0.5 text-cyan-400">
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </div>
        </div>

        {/* Drag Helper Overlay Message (Fades in/out) */}
        {!isDragging && sliderPosition === 50 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/70 backdrop-blur-sm border border-slate-800 text-xs px-3 py-1.5 rounded-full text-slate-300 pointer-events-none flex items-center gap-1.5 animate-bounce z-30">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drag slider to compare</span>
          </div>
        )}
      </div>

      {/* Process Parameters Log (Mock details panel below workspace) */}
      {details && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-mono">
          <div className="space-y-1 border-r border-slate-900/60 pr-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Scale</span>
            <p className="text-slate-350 font-bold">{details.scale}</p>
          </div>
          <div className="space-y-1 border-r border-slate-900/60 pr-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Resolution</span>
            <p className="text-slate-350 font-bold">{details.dimensions}</p>
          </div>
          <div className="space-y-1 border-r border-slate-900/60 pr-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Inference Time</span>
            <p className="text-slate-350 font-bold">{details.timeTaken}</p>
          </div>
          <div className="space-y-1 pr-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Details</span>
            <p className="text-slate-350 font-bold truncate" title={details.faceRestoration}>
              {details.faceRestoration !== "Disabled" ? "CodeFormer Active" : "Real-ESRGAN Only"}
            </p>
          </div>
        </div>
      )}

      {/* Mocking disclaimer message */}
      {isMockCustomUpload && (
        <div className="flex items-start gap-1.5 bg-slate-950/20 border border-slate-900 p-2.5 rounded-lg max-w-lg text-[10px] text-slate-450 leading-relaxed text-center">
          <HelpCircle className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5 mx-auto" />
          <span>
            Demo Mockup Mode: Since you uploaded your own image, we applied a CSS blur filter to the "Before" image to demonstrate the curtain slider effect. Connect a real backend to see actual AI model upscaling.
          </span>
        </div>
      )}
    </div>
  );
}
