import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import useStore from '@/store/useStore'
import ProcessingLoader from '@/components/ProcessingLoader'

export default function AIParams() {
  const router = useRouter()
  const { scene: sceneFromQuery } = router.query
  
  // Get store data
  const currentPhotoId = useStore(state => state.currentPhotoId)
  const userPhotos = useStore(state => state.userPhotos)
  const currentScene = useStore(state => state.currentScene)
  const setSceneType = useStore(state => state.setSceneType)
  const addGeneratedPortrait = useStore(state => state.addGeneratedPortrait)
  
  const [background, setBackground] = useState(50)
  const [lighting, setLighting] = useState(50)
  const [detail, setDetail] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Get the current photo data
  const currentPhoto = userPhotos.find(photo => photo.id === currentPhotoId)
  
  // Redirect if no photo or scene is selected
  useEffect(() => {
    if (!currentPhotoId) {
      router.push('/photo-upload')
    } else if (!currentScene && !sceneFromQuery) {
      router.push('/scene-select')
    } else if (sceneFromQuery && sceneFromQuery !== currentScene) {
      // If scene from query doesn't match store, update store
      setSceneType(sceneFromQuery as string)
    }
  }, [currentPhotoId, currentScene, sceneFromQuery, router, setSceneType])
  
  // The scene to use (from store or query)
  const sceneToUse = currentScene || (sceneFromQuery as string)
  
  // Set default values based on scene
  useEffect(() => {
    if (sceneToUse) {
      switch (sceneToUse) {
        case 'professional':
          setBackground(70)
          setLighting(60)
          setDetail(80)
          break
        case 'passport':
          setBackground(100)
          setLighting(50)
          setDetail(40)
          break
        case 'business':
          setBackground(60)
          setLighting(70)
          setDetail(60)
          break
        case 'academic':
          setBackground(65)
          setLighting(55)
          setDetail(70)
          break
        case 'social':
          setBackground(40)
          setLighting(75)
          setDetail(65)
          break
        case 'wedding':
          setBackground(30)
          setLighting(80)
          setDetail(90)
          break
        case 'student':
          setBackground(90)
          setLighting(50)
          setDetail(40)
          break
        case 'virtual':
          setBackground(20)
          setLighting(60)
          setDetail(50)
          break
        default:
          setBackground(50)
          setLighting(50)
          setDetail(50)
      }
    }
  }, [sceneToUse])
  
  const handleGenerate = () => {
    if (!currentPhotoId || !sceneToUse) return
    
    setIsProcessing(true)
    
    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)
    
    // Simulate portrait generation
    setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)
      
      // Add generated portrait to store
      const portraitId = addGeneratedPortrait({
        originalPhotoId: currentPhotoId,
        scene: sceneToUse,
        dataUrl: currentPhoto?.dataUrl || '', // In a real app, this would be the generated portrait
        parameters: {
          background,
          lighting,
          detail
        }
      })
      
      // Navigate to result page after a short delay
      setTimeout(() => {
        setIsProcessing(false)
        router.push(`/preview-result?portrait=${portraitId}`)
      }, 500)
    }, 3000)
  }

  // Get scene title for display
  const getSceneTitle = () => {
    const scene = sceneToUse?.toLowerCase()
    switch (scene) {
      case 'professional': return 'Professional'
      case 'passport': return 'Passport/Visa'
      case 'business': return 'Business Meeting'
      case 'academic': return 'Academic'
      case 'social': return 'Social Media'
      case 'wedding': return 'Wedding'
      case 'student': return 'Student/Work ID'
      case 'virtual': return 'Virtual Background'
      default: return 'Selected Scene'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Processing Overlay */}
      {isProcessing && (
        <ProcessingLoader 
          isProcessing={isProcessing} 
          progress={progress} 
          text="Generating your portrait..."
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
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/scene-select" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">AI Parameters</h1>
        </div>
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
            <div className="flex-1 h-1 bg-professional-blue mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-professional-blue text-white flex items-center justify-center">
                <CheckIcon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1 text-professional-blue font-medium">Scene</span>
            </div>
            <div className="flex-1 h-1 bg-professional-blue mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-professional-blue text-white flex items-center justify-center">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs mt-1 text-professional-blue font-medium">Result</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          {currentPhoto && (
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-gray-200">
              <img 
                src={currentPhoto.dataUrl} 
                alt="Your photo" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="text-lg font-medium">Step 3: Adjust Parameters</h2>
            <p className="text-gray-600 text-sm">
              Fine-tune your {getSceneTitle()} portrait
            </p>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="mb-6 aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg relative overflow-hidden">
          {currentPhoto && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={currentPhoto.dataUrl} 
                alt="Preview" 
                className="w-full h-full object-cover opacity-80"
                style={{
                  filter: `contrast(${1 + detail/100}) brightness(${1 + lighting/200}) saturate(${1 + background/200})`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                {getSceneTitle()} Preview
              </div>
            </div>
          )}
        </div>

        {/* Parameter Sliders */}
        <div className="space-y-6 mb-8">
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="background" className="block text-sm font-medium text-gray-700">
                Background
              </label>
              <span className="text-sm text-gray-500">{background}%</span>
            </div>
            <input
              type="range"
              id="background"
              min="0"
              max="100"
              value={background}
              onChange={(e) => setBackground(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Simple</span>
              <span>Detailed</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="lighting" className="block text-sm font-medium text-gray-700">
                Lighting
              </label>
              <span className="text-sm text-gray-500">{lighting}%</span>
            </div>
            <input
              type="range"
              id="lighting"
              min="0"
              max="100"
              value={lighting}
              onChange={(e) => setLighting(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Soft</span>
              <span>Dramatic</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="detail" className="block text-sm font-medium text-gray-700">
                Detail Level
              </label>
              <span className="text-sm text-gray-500">{detail}%</span>
            </div>
            <input
              type="range"
              id="detail"
              min="0"
              max="100"
              value={detail}
              onChange={(e) => setDetail(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Smooth</span>
              <span>Sharp</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !currentPhotoId || !sceneToUse}
            className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
              isProcessing || !currentPhotoId || !sceneToUse ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                Generate Portrait
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            This will generate a high-quality AI portrait based on your photo and selected parameters.
          </p>
        </div>
      </main>
    </div>
  )
} 