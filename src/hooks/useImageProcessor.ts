import { useState, useCallback } from 'react'
import { autoOptimizeImage, estimateDataUrlSize } from '@/utils/imageUtils'
import useStore from '@/store/useStore'

interface ImageProcessorOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  autoOptimize?: boolean
}

interface ProcessedImage {
  dataUrl: string
  width: number
  height: number
  aspectRatio: number
  originalFile: File
  sizeKB: number
}

export default function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const quality = useStore(state => state.settings.quality)
  
  const processImage = useCallback(async (
    file: File, 
    options: ImageProcessorOptions = {}
  ): Promise<ProcessedImage | null> => {
    if (!file.type.startsWith('image/')) {
      setError('File is not an image')
      return null
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create a data URL from the file
      let dataUrl = await readFileAsDataURL(file)
      
      // Get initial size estimate
      const initialSizeKB = estimateDataUrlSize(dataUrl)
      
      // Auto-optimize based on quality setting and file size
      const shouldOptimize = options.autoOptimize !== false
      
      if (shouldOptimize) {
        // Apply different optimization levels based on quality setting
        let optimizationQuality = 0.7; // Default for medium quality
        let maxWidth = 800;
        
        if (quality === 'low') {
          optimizationQuality = 0.5;
          maxWidth = 600;
        } else if (quality === 'high') {
          optimizationQuality = 0.9;
          maxWidth = 1200;
        }
        
        // Override with options if provided
        if (options.quality) optimizationQuality = options.quality;
        if (options.maxWidth) maxWidth = options.maxWidth;
        
        // Only optimize if the image is large enough to warrant it
        if (initialSizeKB > 100) {
          dataUrl = await autoOptimizeImage(dataUrl);
        }
      }
      
      // Load the image to get dimensions
      const { width, height } = await getImageDimensions(dataUrl)
      
      // Calculate aspect ratio
      const aspectRatio = width / height
      
      // Get final size estimate
      const sizeKB = estimateDataUrlSize(dataUrl)
      
      // Return the processed image
      return {
        dataUrl,
        width,
        height,
        aspectRatio,
        originalFile: file,
        sizeKB
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error processing image')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [quality])
  
  // Helper function to read a file as a data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file as data URL'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Error reading file'))
      }
      
      reader.readAsDataURL(file)
    })
  }
  
  // Helper function to get image dimensions
  const getImageDimensions = (dataUrl: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }
      
      img.onerror = () => {
        reject(new Error('Error loading image'))
      }
      
      img.src = dataUrl
    })
  }
  
  return {
    processImage,
    isProcessing,
    error
  }
} 