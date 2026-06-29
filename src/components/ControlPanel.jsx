import React, { useState } from 'react';
import { HelpCircle, Sparkles, Wand2, ShieldAlert, Cpu } from 'lucide-react';

export default function ControlPanel({
  faceEnhance,
  setFaceEnhance,
  backgroundEnhance,
  setBackgroundEnhance,
  fidelity,
  setFidelity,
  upscaleFactor,
  setUpscaleFactor,
  onEnhance,
  isProcessing,
  hasImage,
  mode,
  setMode
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const toggleTooltip = (id) => {
    if (activeTooltip === id) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(id);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between h-full space-y-6">
      {/* Panel Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-wide font-jakarta">
          <Wand2 className="w-5 h-5 text-violet-400" />
          <span>Enhancement Settings</span>
        </h3>
        <p className="text-xs text-slate-400">Configure AI model parameters for upscale results.</p>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Enhancement Mode</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-900">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setMode('portrait')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'portrait'
                ? 'bg-gradient-to-r from-violet-650 to-violet-550 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Portrait
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setMode('general')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'general'
                ? 'bg-gradient-to-r from-violet-650 to-violet-550 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            General
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setMode('anime')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'anime'
                ? 'bg-gradient-to-r from-violet-650 to-violet-550 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Art/Anime
          </button>
        </div>
      </div>

      <div className="space-y-6 flex-grow">
        {/* Toggle 1: Face Restoration */}
        {mode === 'portrait' && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-900">
            <div className="flex items-center justify-between">
              <label className="flex flex-col cursor-pointer select-none">
                <span className="text-sm font-semibold text-slate-200">Fix Blurry Faces</span>
                <span className="text-xs text-slate-500 font-mono">CodeFormer Model</span>
              </label>
              <div className="flex items-center gap-2">
                {/* Tooltip trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveTooltip('face')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() => toggleTooltip('face')}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    aria-label="Face Restoration Help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {activeTooltip === 'face' && (
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed">
                      Uses AI to restore, deblur, and re-synthesize facial features while maintaining realism. Perfect for vintage or out-of-focus portraits.
                    </div>
                  )}
                </div>
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setFaceEnhance(!faceEnhance)}
                  disabled={isProcessing}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    faceEnhance ? 'bg-violet-600' : 'bg-slate-800'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      faceEnhance ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Slider for Fidelity: Only display when Face Enhancement is active */}
            <div 
              className={`space-y-2 pt-2 transition-all duration-300 origin-top ${
                faceEnhance ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Fidelity (Face Identity Preservation)</span>
                <span className="text-xs font-bold text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-900/50 font-mono">{fidelity.toFixed(1)}</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={fidelity}
                  disabled={isProcessing}
                  onChange={(e) => setFidelity(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-violet-500 disabled:opacity-50"
                />
                {/* Tooltip trigger for slider details */}
                <div className="mt-2 flex items-start gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <ShieldAlert className="w-3.5 h-3.5 text-violet-400/80 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Lower values fix heavy blur but may change facial identity; higher values keep original shape but reduce sharpening.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle 2: Background Enhance */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between">
          <label className="flex flex-col cursor-pointer select-none">
            <span className="text-sm font-semibold text-slate-200">Sharpen Background</span>
            <span className="text-xs text-slate-500 font-mono">
              {mode === 'anime' ? 'Real-ESRGAN Anime' : mode === 'general' ? 'Swin2SR / Real-ESRGAN' : 'Real-ESRGAN Model'}
            </span>
          </label>
          <div className="flex items-center gap-2">
            {/* Tooltip trigger */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip('background')}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => toggleTooltip('background')}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                aria-label="Background Enhance Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {activeTooltip === 'background' && (
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed">
                  Cleans up compression artifacts, edge blur, and scales textures like stone walls, clothing, structures, and scenery.
                </div>
              )}
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => setBackgroundEnhance(!backgroundEnhance)}
              disabled={isProcessing}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                backgroundEnhance ? 'bg-violet-600' : 'bg-slate-800'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  backgroundEnhance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Option 3: Upscale Factor */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Scale Factor</span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-855">
              <button
                type="button"
                onClick={() => setUpscaleFactor(2)}
                disabled={isProcessing}
                className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  upscaleFactor === 2
                    ? 'bg-violet-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-250 hover:bg-slate-800/40'
                } disabled:opacity-50`}
              >
                2x
              </button>
              <button
                type="button"
                onClick={() => setUpscaleFactor(4)}
                disabled={isProcessing}
                className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  upscaleFactor === 4
                    ? 'bg-violet-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-250 hover:bg-slate-800/40'
                } disabled:opacity-50`}
              >
                4x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-slate-800/50">
        <button
          type="button"
          onClick={onEnhance}
          disabled={!hasImage || isProcessing}
          className={`w-full relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold tracking-wider uppercase text-sm border transition-all duration-300 shadow-lg ${
            !hasImage 
              ? 'bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed shadow-none'
              : isProcessing
                ? 'bg-violet-950/30 border-violet-900/50 text-violet-400 cursor-wait'
                : 'bg-gradient-to-r from-violet-650 to-violet-550 border-violet-500 text-white hover:from-violet-600 hover:to-violet-500 glow-button'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mr-1" />
              <span>Upscaling Image...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>Enhance Image</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
