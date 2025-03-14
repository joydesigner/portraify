import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, PhotoIcon, ExclamationCircleIcon, CheckCircleIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import useImageProcessor from '@/hooks/useImageProcessor'

interface PhotoUploaderProps {
  onUpload: (file: File, dataUrl: string) => void
  maxSizeMB?: number
}

export default function PhotoUploader({ onUpload, maxSizeMB = 10 }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const { processImage, isProcessing, error: processingError } = useImageProcessor()

  // Reset error when preview changes
  useEffect(() => {
    if (preview) {
      setError(null)
    }
  }, [preview])

  // Simulate face detection
  const detectFace = useCallback(async (dataUrl: string): Promise<boolean> => {
    setIsAnalyzing(true)
    
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, we'll assume 90% of uploads have a valid face
        const hasFace = Math.random() > 0.1
        setFaceDetected(hasFace)
        setIsAnalyzing(false)
        resolve(hasFace)
      }, 1500)
    })
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    setFaceDetected(null)
    
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }
    
    try {
      // Process the image
      const processedImage = await processImage(file)
      
      if (processedImage) {
        setPreview(processedImage.dataUrl)
        
        // Detect face in the image
        const hasFace = await detectFace(processedImage.dataUrl)
        
        if (hasFace) {
          // Only call onUpload if face is detected
          onUpload(file, processedImage.dataUrl)
        }
      }
    } catch (err) {
      setError('Error processing image')
      console.error(err)
    }
  }, [onUpload, processImage, detectFace, maxSizeMB])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    maxFiles: 1,
    multiple: false
  })

  // Combine errors
  const displayError = error || processingError

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`card border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragActive && !isDragReject
            ? 'border-professional-blue bg-blue-50' 
            : isDragReject || displayError
              ? 'border-red-400 bg-red-50'
              : faceDetected === true
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        {isProcessing || isAnalyzing ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-professional-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium mb-1">
              {isProcessing ? 'Processing image...' : 'Analyzing face...'}
            </p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              
              {faceDetected !== null && (
                <div className={`absolute bottom-0 right-0 p-1 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`}>
                  {faceDetected ? (
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  ) : (
                    <ExclamationCircleIcon className="h-6 w-6 text-white" />
                  )}
                </div>
              )}
            </div>
            
            {faceDetected === false && (
              <div className="text-red-500 text-center mb-4">
                <p className="font-medium">No face detected</p>
                <p className="text-sm">Please upload a clear photo of your face</p>
              </div>
            )}
            
            {faceDetected === true && (
              <div className="text-green-600 text-center mb-4">
                <p className="font-medium">Face detected successfully!</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <>
            {isDragReject || displayError ? (
              <ExclamationCircleIcon className="h-16 w-16 text-red-500 mb-4" />
            ) : isDragActive ? (
              <CloudArrowUpIcon className="h-16 w-16 text-professional-blue mb-4" />
            ) : (
              <div className="relative">
                <PhotoIcon className="h-16 w-16 text-gray-400 mb-4" />
                <FaceSmileIcon className="h-8 w-8 text-professional-blue absolute -bottom-2 -right-2" />
              </div>
            )}
            
            {displayError ? (
              <div className="text-center">
                <p className="text-lg font-medium text-red-600 mb-1">
                  {displayError}
                </p>
                <p className="text-sm text-gray-500">
                  Please try a different image
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium mb-1">
                  {isDragActive 
                    ? isDragReject 
                      ? 'File type not supported' 
                      : 'Drop your photo here' 
                    : 'Upload your photo'}
                </p>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-gray-400 text-center">
                  Supports JPG, PNG (max {maxSizeMB}MB)
                </p>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Tips for better results */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for best results:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a well-lit photo with a neutral background</li>
          <li>• Ensure your face is clearly visible and centered</li>
          <li>• Avoid wearing sunglasses or hats</li>
          <li>• Look directly at the camera with a neutral expression</li>
        </ul>
      </div>
    </div>
  )
} 