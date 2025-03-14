/**
 * Utility functions for image processing and optimization
 */

/**
 * Compresses an image data URL by reducing its quality and dimensions
 * @param dataUrl The original image data URL
 * @param quality The quality to use (0-1)
 * @param maxWidth The maximum width to resize to
 * @returns A promise that resolves to the compressed data URL
 */
export const compressImageDataUrl = async (
  dataUrl: string, 
  quality = 0.7, 
  maxWidth = 800
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image to load the data URL
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.floor(height * ratio);
        }
        
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Estimates the size of a data URL in kilobytes
 * @param dataUrl The data URL
 * @returns The estimated size in KB
 */
export const estimateDataUrlSize = (dataUrl: string): number => {
  // Base64 encoding increases size by approximately 33%
  // So we divide by 1.33 to get a rough estimate of the original size
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  const estimatedBytes = (base64Length * 3) / 4;
  return Math.round(estimatedBytes / 1024); // Convert to KB
};

/**
 * Automatically optimizes an image data URL based on its size
 * @param dataUrl The original image data URL
 * @returns A promise that resolves to the optimized data URL
 */
export const autoOptimizeImage = async (dataUrl: string): Promise<string> => {
  const sizeKB = estimateDataUrlSize(dataUrl);
  
  // If the image is already small, don't compress it further
  if (sizeKB < 100) {
    return dataUrl;
  }
  
  // Determine compression level based on size
  let quality = 0.7;
  let maxWidth = 800;
  
  if (sizeKB > 1000) {
    quality = 0.5;
    maxWidth = 600;
  } else if (sizeKB > 500) {
    quality = 0.6;
    maxWidth = 700;
  }
  
  return compressImageDataUrl(dataUrl, quality, maxWidth);
}; 