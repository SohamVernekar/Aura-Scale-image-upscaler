import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, Image as ImageIcon, CheckCircle, Wand2, Sliders, ChevronLeft } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ControlPanel from './components/ControlPanel';
import ComparisonSlider from './components/ComparisonSlider';
import { handleEnhanceImage, SAMPLE_IMAGES, resizeImageIfNeeded } from './services/upscaleService';

export default function App() {
  // Core application states
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Model tuning parameters
  const [faceEnhance, setFaceEnhance] = useState(true);
  const [backgroundEnhance, setBackgroundEnhance] = useState(true);
  const [fidelity, setFidelity] = useState(0.6);
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [isDemoSample, setIsDemoSample] = useState(false);

  // UX states
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultDetails, setResultDetails] = useState(null);

  // Handles custom file upload select
  const handleImageSelect = async (base64Data) => {
    try {
      const optimizedImage = await resizeImageIfNeeded(base64Data);
      setOriginalImage(optimizedImage);
    } catch (err) {
      console.error('Image resizing failed, falling back to original:', err);
      setOriginalImage(base64Data);
    }
    setProcessedImage(null);
    setResultDetails(null);
    setIsDemoSample(false);
  };

  // Triggers the mock upscaling API
  const handleEnhance = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessedImage(null);

    try {
      const response = await handleEnhanceImage({
        image: originalImage,
        faceEnhance,
        fidelity,
        backgroundEnhance,
        upscaleFactor,
        isDemoSample
      });

      setProcessedImage(response.processedImage);
      setResultDetails(response.details);
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred during image processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulates a demo sample run
  const handleUseDemoSample = () => {
    setOriginalImage(SAMPLE_IMAGES.original);
    setProcessedImage(null);
    setResultDetails(null);
    setIsDemoSample(true);
  };

  // Handles state reset to upload screen
  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setResultDetails(null);
    setIsDemoSample(false);
    setProgress(0);
  };

  // Download logic (proxies remote Hugging Face images through backend to bypass CORS/popup blockers)
  const handleDownload = () => {
    if (!processedImage) return;

    // If it's a remote URL from Hugging Face, proxy it through our server
    if (processedImage.startsWith('http')) {
      const backendDownloadUrl = `http://localhost:5000/api/download?url=${encodeURIComponent(processedImage)}`;
      // Direct navigation assignment triggers file download dialog without changing page context or triggering popup blockers
      window.location.href = backendDownloadUrl;
    } else {
      // For local base64/data URLs
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `aurascale_${upscaleFactor}x_enhanced.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Progress Bar simulator for processing state
  useEffect(() => {
    let interval = null;
    if (isProcessing) {
      let speed = 40; // milliseconds per step
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 99) {
            clearInterval(interval);
            return 99;
          }
          return prevProgress + 1;
        });
      }, speed);
    } else {
      setProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Status message transition based on progress percentage
  useEffect(() => {
    if (!isProcessing) {
      setStatusMessage('');
      return;
    }
    
    if (progress < 20) {
      setStatusMessage('Initializing upscale pipeline...');
    } else if (progress < 45) {
      setStatusMessage(faceEnhance ? 'Running CodeFormer Face Restoration...' : 'Preparing image dimensions...');
    } else if (progress < 70) {
      setStatusMessage(backgroundEnhance ? 'Analyzing textures & Sharpening background (Real-ESRGAN)...' : 'Scaling images...');
    } else if (progress < 90) {
      setStatusMessage(`Resynthesizing detail channels to ${upscaleFactor}x factor...`);
    } else {
      setStatusMessage('Finalizing quality rendering metrics...');
    }
  }, [progress, isProcessing, faceEnhance, backgroundEnhance, upscaleFactor]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-outfit relative">
      {/* Background ambient lighting elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleReset}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent m-0 font-jakarta">
                AuraScale <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">Image Enhancement Suite</p>
            </div>
          </div>

          {/* Badges/Tools */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Developer Sandboxed Frontend
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col justify-center">
        {!originalImage ? (
          /* Scene 1: Upload Dropzone UI */
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-jakarta">
                Restore and upscale image textures
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Transform blurry, pixelated or low-resolution portrait shots and landscapes into sharp, high-definition assets instantly.
              </p>
            </div>
            
            <UploadZone 
              onImageSelect={handleImageSelect} 
              onUseDemoSample={handleUseDemoSample} 
            />
          </div>
        ) : (
          /* Scene 2: Interactive Editor Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Frame: Image View / Interactive Slider Workspace */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              
              {/* Back to upload trigger button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Upload Different Image</span>
                </button>

                {processedImage && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-950/20 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Processing Completed
                  </span>
                )}
              </div>

              {/* Viewport Core Block */}
              <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
                
                {isProcessing ? (
                  /* Loading State View */
                  <div className="flex flex-col items-center justify-center py-20 px-8 space-y-6 w-full max-w-md text-center">
                    <div className="relative">
                      {/* Spinner core */}
                      <div className="w-16 h-16 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-cyan-400 rounded-full animate-spin [animation-duration:1.5s]" />
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400">Restoration Progress</span>
                        <span className="text-violet-400 font-bold">{progress}%</span>
                      </div>
                      
                      {/* Progress bar line */}
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <p className="text-xs text-slate-400 font-mono animate-pulse min-h-[1.5rem]">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                ) : processedImage ? (
                  /* Comparative Result Curtain Slider View */
                  <div className="w-full animate-fade-in">
                    <ComparisonSlider 
                      originalImage={originalImage} 
                      processedImage={processedImage} 
                      details={resultDetails}
                    />

                    {/* Download Controls block */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-550 to-violet-650 text-white font-bold text-sm tracking-wide shadow-lg hover:from-cyan-500 hover:to-violet-500 active:scale-98 transition-all glow-cyan cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Enhanced Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800 hover:border-slate-700 text-sm font-semibold transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Enhance Another Image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Original Preview / Pending Enhancement state */
                  <div className="w-full flex flex-col items-center space-y-6">
                    <div className="relative aspect-square md:aspect-[4/3] w-full max-h-[460px] rounded-xl overflow-hidden border border-slate-850 bg-slate-950/20">
                      <div className="absolute inset-0 grid-bg opacity-20" />
                      <img 
                        src={originalImage} 
                        alt="Preview Original" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center p-6 text-center">
                        <span className="text-xs text-slate-450 font-semibold flex items-center gap-1.5 backdrop-blur-sm bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          Ready for processing
                        </span>
                      </div>
                    </div>

                    <div className="text-center space-y-2 max-w-sm px-4">
                      <h4 className="text-sm font-bold text-slate-200">Enhancement Pending</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Adjust enhancement factors inside the control panel on the right, and hit the "Enhance Image" button to launch.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Frame: Sidebar Control Parameters */}
            <div className="lg:col-span-4 h-full">
              <ControlPanel 
                faceEnhance={faceEnhance}
                setFaceEnhance={setFaceEnhance}
                backgroundEnhance={backgroundEnhance}
                setBackgroundEnhance={setBackgroundEnhance}
                fidelity={fidelity}
                setFidelity={setFidelity}
                upscaleFactor={upscaleFactor}
                setUpscaleFactor={setUpscaleFactor}
                onEnhance={handleEnhance}
                isProcessing={isProcessing}
                hasImage={!!originalImage}
              />
            </div>
            
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-6 mt-12 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 AuraScale AI. Made for premium face restoration & photo upscaling. All rights reserved.</p>
      </footer>
    </div>
  );
}
