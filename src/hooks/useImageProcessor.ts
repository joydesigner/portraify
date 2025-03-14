import { useState, useCallback } from 'react'

interface ImageProcessorOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

interface ProcessedImage {
  dataUrl: string
  width: number
  height: number
  aspectRatio: number
  originalFile: File
}

export default function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
      const dataUrl = await readFileAsDataURL(file)
      
      // Load the image to get dimensions
      const { width, height } = await getImageDimensions(dataUrl)
      
      // Calculate aspect ratio
      const aspectRatio = width / height
      
      // Return the processed image
      return {
        dataUrl,
        width,
        height,
        aspectRatio,
        originalFile: file
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error processing image')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])
  
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