import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export default function UploadZone({ onImageSelect, onUseDemoSample }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    
    // Check file size (limit to 10MB for mock performance)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect(e.target.result); // Pass the base64 URL to parent state
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Upload Box container with background glowing grid effect */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative cursor-pointer group flex flex-col items-center justify-center min-h-[360px] border-2 border-dashed rounded-2xl transition-all duration-500 overflow-hidden glass-panel ${
          isDragActive 
            ? 'border-violet-500 bg-violet-950/20 scale-[1.01] shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
            : 'border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/30'
        }`}
      >
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        
        {/* Decorative ambient background glows */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/15 transition-all duration-500" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl group-hover:bg-cyan-600/15 transition-all duration-500" />

        <input 
          ref={fileInputRef}
          type="file" 
          id="image-upload-input" 
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />

        <div className="relative flex flex-col items-center text-center p-8 space-y-6 z-10">
          {/* Animated Icon Area */}
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-violet-400 group-hover:text-violet-300 group-hover:border-violet-500/30 group-hover:scale-110 transition-all duration-500 ${
              isDragActive ? 'scale-110 border-violet-500 text-violet-300' : ''
            }`}>
              <Upload className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          {/* Text Instructions */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100 tracking-wide">
              Drag and drop your image here
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Supports PNG, JPG, JPEG or WEBP (Max 10MB).
            </p>
          </div>

          {/* Action Trigger Button */}
          <button 
            type="button"
            className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-medium text-slate-200 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500 transition-all duration-300 shadow-sm"
          >
            Select Image File
          </button>
        </div>
      </div>

      {/* Error Message display */}
      {errorMessage && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Demo Sample Image CTA */}
      <div className="mt-8 text-center">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-3">Or try the app instantly</span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering file input click
            onUseDemoSample();
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600/10 via-cyan-600/10 to-violet-600/10 hover:from-violet-600/20 hover:to-cyan-600/20 text-violet-300 hover:text-cyan-200 border border-violet-500/20 hover:border-cyan-500/30 text-sm font-semibold tracking-wide transition-all duration-300 glow-cyan scale-100 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Demo Face Restoration (CodeFormer)</span>
        </button>
      </div>
    </div>
  );
}
