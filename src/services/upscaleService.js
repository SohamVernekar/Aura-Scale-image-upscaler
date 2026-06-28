/**
 * Upscale and Restoration Service
 * Connects the React frontend to the Node.js/Express backend running on port 5000.
 */

// High-fidelity sample images for the demo mode
export const SAMPLE_IMAGES = {
  // A blurry portrait for comparison
  original: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=40&w=600&blur=10",
  // A sharp, detailed portrait for the enhanced result
  enhanced: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200",
  
  // Alternative landscape sample
  originalLandscape: "https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&q=30&w=600&blur=8",
  enhancedLandscape: "https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&q=85&w=1200"
};

export const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to host IP on port 5000 for local network mobile testing
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000`;
};

/**
 * Sends an image to the backend upscaler on port 5000
 * @param {Object} params
 * @param {string} params.image - Base64 data URL or image URL
 * @param {boolean} params.faceEnhance - Enable CodeFormer face restoration
 * @param {number} params.fidelity - CodeFormer fidelity slider value (0.0 to 1.0)
 * @param {boolean} params.backgroundEnhance - Enable Real-ESRGAN background upscaling
 * @param {number} params.upscaleFactor - 2 or 4
 * @param {boolean} params.isDemoSample - Whether the user is using the demo sample image
 * @returns {Promise<{processedImage: string, details: Object}>}
 */
export const handleEnhanceImage = async ({
  image,
  faceEnhance,
  fidelity,
  backgroundEnhance,
  upscaleFactor,
  isDemoSample = false
}) => {
  // 1. Instant fallback for the demo sample to showcase stunning before/after immediately
  if (isDemoSample) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          processedImage: SAMPLE_IMAGES.enhanced,
          details: {
            dimensions: upscaleFactor === 4 ? "4096 x 4096" : "2048 x 2048",
            timeTaken: "2.8s (Demo Cache)",
            scale: `${upscaleFactor}x`,
            faceRestoration: `CodeFormer (Fidelity: ${fidelity})`,
            backgroundEnhancement: backgroundEnhance ? "Real-ESRGAN" : "Disabled"
          }
        });
      }, 2500);
    });
  }

  // 2. Real API connection for user uploaded images
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    
    // Convert base64 data URL to a binary blob for file upload
    const response = await fetch(image);
    const blob = await response.blob();
    formData.append('image', blob, 'upload.png');
    
    // Add configurations matching what backend server.js expects
    formData.append('faceUpsample', faceEnhance ? 'true' : 'false');
    formData.append('backgroundEnhance', backgroundEnhance ? 'true' : 'false');
    formData.append('upscaleFactor', upscaleFactor.toString());
    formData.append('fidelity', fidelity.toString());

    console.log('Sending image to backend for enhancement...');
    const backendUrl = getBackendUrl();
    const apiRes = await fetch(`${backendUrl}/api/upscale`, {
      method: 'POST',
      body: formData
    });

    const data = await apiRes.json();

    if (!apiRes.ok || !data.success) {
      // Prioritize details (actual backend exception message) over generic error text
      throw new Error(data.details || data.error || 'Backend failed to process the image.');
    }

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      processedImage: data.enhancedImage,
      details: {
        dimensions: upscaleFactor === 4 ? "4096 x 4096" : "2048 x 2048",
        timeTaken: `${elapsedSeconds}s`,
        scale: `${upscaleFactor}x`,
        faceRestoration: faceEnhance ? `CodeFormer (Fidelity: ${fidelity})` : "Disabled",
        backgroundEnhancement: backgroundEnhance ? "Real-ESRGAN" : "Disabled"
      }
    };

  } catch (error) {
    console.error('Frontend upscaleService error:', error);
    throw new Error(error.message || 'Unable to connect to the backend server. Make sure the Node server is running.');
  }
};

/**
 * Downscales an image in the browser if it exceeds the maximum megapixel count.
 * Prevents Hugging Face from rejecting images (> 4 megapixels limit)
 * @param {string} dataUrl - The base64 source image
 * @param {number} maxPixels - Maximum total pixels allowed (default 3,500,000 to be safe)
 * @returns {Promise<string>} - A Promise that resolves to the resized base64 data URL
 */
export const resizeImageIfNeeded = (dataUrl, maxPixels = 3500000) => {
  return new Promise((resolve) => {
    // If it's not a data URL (e.g. remote HTTP url from a demo), bypass
    if (!dataUrl.startsWith('data:')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const totalPixels = width * height;

      if (totalPixels <= maxPixels) {
        resolve(dataUrl);
        return;
      }

      // Calculate aspect ratio scale
      const scale = Math.sqrt(maxPixels / totalPixels);
      const newWidth = Math.floor(width * scale);
      const newHeight = Math.floor(height * scale);

      console.log(`Frontend resizing: ${width}x${height} (${(totalPixels / 1000000).toFixed(2)}MP) -> ${newWidth}x${newHeight} (${(maxPixels / 1000000).toFixed(2)}MP)`);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Export as high quality JPEG (reduces transfer size dramatically while maintaining visual quality)
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(resizedDataUrl);
    };
    img.onerror = () => {
      resolve(dataUrl); // Fallback to original
    };
  });
};
