/**
 * AI Service for portrait generation
 * This service handles the integration with AI APIs for portrait generation
 */

import { estimateDataUrlSize } from '@/utils/imageUtils';
import { generateKolorsPortrait, KolorsPortraitRequest, KolorsPortraitResponse } from './kolorsAPI';

// Types for AI portrait generation
export interface AIPortraitParams {
  photoDataUrl: string;
  scene: string;
  background: number;
  lighting: number;
  detail: number;
  useKolors?: boolean; // Flag to use Kolors API
  style?: string; // Optional style parameter for Kolors
  resolution?: string; // Optional resolution parameter
}

export interface AIPortraitResult {
  portraitDataUrl: string;
  processingTime: number;
  sizeKB: number;
  kolorsId?: string; // ID from Kolors API if used
}

// Mock AI processing delay (simulates API call)
const mockAIProcessingDelay = (progress: (percent: number) => void): Promise<void> => {
  return new Promise((resolve) => {
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.random() * 5;
      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
        resolve();
      }
      progress(percent);
    }, 200);
  });
};

/**
 * Apply AI transformations to the image based on parameters
 * In a real app, this would call an actual AI API
 */
export const applyAITransformations = async (
  dataUrl: string, 
  scene: string, 
  background: number, 
  lighting: number, 
  detail: number,
  imageSize: number = 100,
  resolution: string = '1024x1024'
): Promise<string> => {
  // Create a canvas to apply transformations
  const img = new Image();
  
  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return dataUrl;
  }
  
  // Parse resolution string to get width and height
  const [width, height] = resolution.split('x').map(Number);
  
  // Set canvas dimensions to the specified resolution
  canvas.width = width;
  canvas.height = height;
  
  // Calculate scaling to fit the image while maintaining aspect ratio
  const scale = Math.min(
    width / img.width,
    height / img.height
  );
  
  // Calculate position to center the image
  const x = (width - img.width * scale) / 2;
  const y = (height - img.height * scale) / 2;
  
  // Draw the image with scaling and centering
  ctx.drawImage(
    img,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
  
  // Apply subtle enhancements based on scene
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply subtle skin smoothing
  for (let i = 0; i < data.length; i += 4) {
    // Get surrounding pixels (simple 3x3 kernel)
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Apply subtle skin smoothing
    if (luminance > 0.3 && luminance < 0.9) {
      // Reduce noise in skin tones
      data[i] = Math.round(r * 0.95 + (r + g + b) / 3 * 0.05);
      data[i + 1] = Math.round(g * 0.95 + (r + g + b) / 3 * 0.05);
      data[i + 2] = Math.round(b * 0.95 + (r + g + b) / 3 * 0.05);
    }
  }
  
  // Apply subtle lighting enhancement
  const lightingEffect = lighting / 100;
  for (let i = 0; i < data.length; i += 4) {
    // Enhance highlights and shadows
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Apply subtle contrast enhancement
    const contrast = 1 + (lightingEffect - 0.5) * 0.1;
    data[i] = Math.min(255, Math.max(0, (r - 128) * contrast + 128));
    data[i + 1] = Math.min(255, Math.max(0, (g - 128) * contrast + 128));
    data[i + 2] = Math.min(255, Math.max(0, (b - 128) * contrast + 128));
  }
  
  // Apply subtle detail enhancement
  if (detail > 50) {
    const detailEffect = (detail - 50) / 50;
    for (let i = 0; i < data.length; i += 4) {
      // Enhance edge contrast
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Apply subtle sharpening
      data[i] = Math.min(255, Math.max(0, r + (r - (r + g + b) / 3) * detailEffect));
      data[i + 1] = Math.min(255, Math.max(0, g + (g - (r + g + b) / 3) * detailEffect));
      data[i + 2] = Math.min(255, Math.max(0, b + (b - (r + g + b) / 3) * detailEffect));
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Apply scene-specific effects
  applySceneSpecificEffects(ctx, canvas.width, canvas.height, scene);
  
  // Return the processed image with high quality
  return canvas.toDataURL('image/jpeg', 1.0);
};

/**
 * Get background color based on scene
 */
const getSceneBackgroundColor = (scene: string): string => {
  switch (scene.toLowerCase()) {
    case 'professional':
      return '#e6e6e6'; // Light gray
    case 'passport':
      return '#ffffff'; // White
    case 'business':
      return '#f0f5fa'; // Light blue-gray
    case 'academic':
      return '#f5f5f0'; // Light beige
    case 'social':
      return '#f0f0f5'; // Light purple
    case 'wedding':
      return '#fff5f5'; // Light pink
    case 'student':
      return '#f0f8ff'; // Light blue
    case 'virtual':
      return '#e0f0e0'; // Light green
    default:
      return '#f0f0f0'; // Default light gray
  }
};

/**
 * Apply scene-specific effects
 */
const applySceneSpecificEffects = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: string
): void => {
  switch (scene.toLowerCase()) {
    case 'professional':
      // Add very subtle vignette
      addVignette(ctx, width, height, 0.05);
      break;
    case 'passport':
      // Add white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, width, height);
      break;
    case 'business':
      // Add very subtle blue tint
      addColorTint(ctx, width, height, 'rgba(0, 0, 100, 0.02)');
      break;
    case 'academic':
      // Add very subtle warm tint
      addColorTint(ctx, width, height, 'rgba(100, 50, 0, 0.02)');
      break;
    case 'social':
      // Add very subtle color boost
      addColorTint(ctx, width, height, 'rgba(50, 0, 100, 0.02)');
      break;
    case 'wedding':
      // Add very subtle glow
      addGlow(ctx, width, height);
      break;
    case 'student':
      // Add very subtle blue tint
      addColorTint(ctx, width, height, 'rgba(0, 50, 100, 0.02)');
      break;
    case 'virtual':
      // Add very subtle grid
      addGridOverlay(ctx, width, height);
      break;
  }
};

/**
 * Add vignette effect
 */
const addVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void => {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.5
  );
  
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Add color tint
 */
const addColorTint = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Add glow effect
 */
const addGlow = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.shadowColor = 'rgba(255, 255, 200, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
  ctx.fillRect(0, 0, width, height);
  ctx.shadowBlur = 0;
};

/**
 * Add grid overlay for virtual backgrounds
 */
const addGridOverlay = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.strokeStyle = 'rgba(0, 100, 200, 0.1)';
  ctx.lineWidth = 1;
  
  // Draw horizontal lines
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw vertical lines
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
};

/**
 * Convert dataURL to base64 string (removing the prefix)
 */
const dataURLToBase64 = (dataURL: string): string => {
  return dataURL.split(',')[1];
};

/**
 * Convert base64 to dataURL
 */
const base64ToDataURL = (base64: string, mimeType = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Generate AI portrait
 */
export const generateAIPortrait = async (
  params: AIPortraitParams,
  onProgress: (percent: number) => void
): Promise<AIPortraitResult> => {
  const startTime = Date.now();
  
  // Check if we should use Kolors API
  if (params.useKolors) {
    try {
      // Prepare request for Kolors API
      const kolorsRequest: KolorsPortraitRequest = {
        image: dataURLToBase64(params.photoDataUrl),
        scene: params.scene,
        parameters: {
          background: params.background,
          lighting: params.lighting,
          detail: params.detail,
          style: params.style,
          resolution: params.resolution
        }
      };
      
      // Call Kolors API
      const kolorsResponse = await generateKolorsPortrait(kolorsRequest, onProgress);
      
      // Check if the request was successful
      if (kolorsResponse.status === 'completed' && kolorsResponse.result) {
        // Calculate processing time
        const processingTime = (Date.now() - startTime) / 1000;
        
        // Convert base64 to data URL
        const portraitDataUrl = base64ToDataURL(kolorsResponse.result.image);
        
        // Get size from response or estimate
        const sizeKB = kolorsResponse.result.metadata.size || estimateDataUrlSize(portraitDataUrl);
        
        return {
          portraitDataUrl,
          processingTime,
          sizeKB,
          kolorsId: kolorsResponse.id
        };
      } else {
        // If Kolors API failed, fall back to local processing
        console.warn('Kolors API failed, falling back to local processing:', kolorsResponse.error);
        onProgress(0); // Reset progress
      }
    } catch (error) {
      console.error('Error using Kolors API:', error);
      onProgress(0); // Reset progress
    }
  }
  
  // If not using Kolors or if Kolors failed, use local processing
  // Simulate AI processing time
  await mockAIProcessingDelay(onProgress);
  
  // Apply AI transformations
  const portraitDataUrl = await applyAITransformations(
    params.photoDataUrl,
    params.scene,
    params.background,
    params.lighting,
    params.detail,
    100, // Default image size
    params.resolution || '1024x1024' // Use provided resolution or default
  );
  
  // Calculate processing time
  const processingTime = (Date.now() - startTime) / 1000;
  
  // Estimate size
  const sizeKB = estimateDataUrlSize(portraitDataUrl);
  
  return {
    portraitDataUrl,
    processingTime,
    sizeKB
  };
}; 