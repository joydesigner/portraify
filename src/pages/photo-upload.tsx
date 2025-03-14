import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, CloudArrowUpIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import PhotoUploader from '@/components/PhotoUploader'
import ProcessingLoader from '@/components/ProcessingLoader'
import useStore from '@/store/useStore'

export default function PhotoUpload() {
  const router = useRouter()
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Get store functions
  const addUserPhoto = useStore(state => state.addUserPhoto)
  const setCurrentPhoto = useStore(state => state.setCurrentPhoto)

  const handlePhotoUpload = (file: File, dataUrl: string) => {
    setUploadedPhoto(file)
    setPhotoDataUrl(dataUrl)
  }

  const handleContinue = () => {
    if (uploadedPhoto && photoDataUrl) {
      setIsProcessing(true)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 300)
      
      // Simulate processing and save to store
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        // Add photo to store
        const photoId = addUserPhoto({
          dataUrl: photoDataUrl,
          width: 800, // Placeholder values
          height: 800
        })
        
        // Set as current photo
        setCurrentPhoto(photoId)
        
        // Navigate to scene selection after a short delay
        setTimeout(() => {
          setIsProcessing(false)
          router.push('/scene-select')
        }, 500)
      }, 2500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Processing Overlay */}
      {isProcessing && (
        <ProcessingLoader 
          isProcessing={isProcessing} 
          progress={uploadProgress} 
          text="Preparing your photo..."
        />
      )}
      
      {/* Status Bar */}
      <div className="bg-black text-white p-2 flex justify-between items-center text-xs">
        <div>9:41</div>
        <div className="flex items-center gap-1">
          <span>100%</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="4" y="8" width="16" height="8" rx="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Upload Your Photo</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-professional-blue text-white flex items-center justify-center">
                <CheckIcon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1 text-professional-blue font-medium">Upload</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-gray-200"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs mt-1 text-gray-500">Scene</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-gray-200"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs mt-1 text-gray-500">Result</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium mb-1">Step 1: Upload Your Photo</h2>
          <p className="text-gray-600 text-sm">
            Upload a clear photo of your face to generate professional portraits.
            We'll analyze your photo to ensure the best results.
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <PhotoUploader onUpload={handlePhotoUpload} maxSizeMB={10} />

          {uploadedPhoto && photoDataUrl && (
            <div className="mt-6 flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-green-800 font-medium">
                  Photo ready for processing
                </p>
                <p className="text-green-600 text-sm">
                  {uploadedPhoto.name} ({Math.round(uploadedPhoto.size / 1024)} KB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={!uploadedPhoto || !photoDataUrl || isProcessing}
            className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
              !uploadedPhoto || !photoDataUrl || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Continue to Scene Selection
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            By continuing, you agree to our <a href="#" className="text-professional-blue">Terms of Service</a> and <a href="#" className="text-professional-blue">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  )
} 