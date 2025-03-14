import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, InformationCircleIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import useStore from '@/store/useStore'
import ProcessingLoader from '@/components/ProcessingLoader'
import useAIPortrait from '@/hooks/useAIPortrait'
import { applyAITransformations } from '@/services/aiService'

export default function AIParams() {
  const router = useRouter()
  const { scene: sceneFromQuery } = router.query
  
  // Get store data
  const currentPhotoId = useStore(state => state.currentPhotoId)
  const userPhotos = useStore(state => state.userPhotos)
  const currentScene = useStore(state => state.currentScene)
  const setSceneType = useStore(state => state.setSceneType)
  const addGeneratedPortrait = useStore(state => state.addGeneratedPortrait)
  
  // AI portrait generation
  const { generatePortrait, isGenerating, progress, error: generationError } = useAIPortrait()
  
  // const [background, setBackground] = useState(50)
  // const [lighting, setLighting] = useState(50)
  // const [detail, setDetail] = useState(50)
  // const [imageSize, setImageSize] = useState(100) // Default to 100%
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1') // Default to square
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [useKolors, setUseKolors] = useState(true) // Default to using Kolors
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(undefined)
  
  // Available Kolors styles
  const kolorsStyles = [
    { id: 'natural', name: 'Natual Style', description: 'Keep the natural appearance of the portrait' },
    { id: 'professional', name: 'Professional Style', description: 'Suitable for business and professional occasions' },
    { id: 'artistic', name: 'Artistic Style', description: 'Enhance color and artistic effects' },
    { id: 'dramatic', name: 'Dramatic Style', description: 'Strong contrast of light and shadow' },
  ]
  
  // Available aspect ratios
  const aspectRatios = [
    { id: '1:1', name: 'Square', description: 'Perfect for profile photos' },
    { id: '1:2', name: 'Portrait', description: 'Tall portrait format' },
    { id: '3:2', name: 'Landscape', description: 'Wide landscape format' },
    { id: '3:4', name: 'Vertical', description: 'Tall vertical format' },
    { id: '16:9', name: 'Widescreen', description: 'Standard widescreen' },
    { id: '9:16', name: 'Mobile', description: 'Mobile-friendly vertical' },
  ]
  
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
          setSelectedAspectRatio('1:1')
          setSelectedStyle('professional')
          break
        case 'passport':
          setSelectedAspectRatio('1:1')
          setSelectedStyle('natural')
          break
        case 'business':
          setSelectedAspectRatio('1:1')
          setSelectedStyle('professional')
          break
        case 'academic':
          setSelectedAspectRatio('1:1')
          setSelectedStyle('natural')
          break
        case 'social':
          setSelectedAspectRatio('1:1')
          setSelectedStyle('artistic')
          break
        case 'wedding':
          setSelectedAspectRatio('3:2')
          setSelectedStyle('dramatic')
          break
        case 'student':
          setSelectedAspectRatio('1:1')
          setSelectedStyle('natural')
          break
        case 'virtual':
          setSelectedAspectRatio('16:9')
          setSelectedStyle('artistic')
          break
        default:
          setSelectedAspectRatio('1:1')
          setSelectedStyle('natural')
      }
    }
  }, [sceneToUse])
  
  // Generate preview image when parameters change
  const generatePreview = useCallback(async () => {
    if (!currentPhoto || !sceneToUse) return
    
    try {
      setIsPreviewLoading(true)
      
      // Use a debounced version of the AI transformation for preview
      const previewDataUrl = await applyAITransformations(
        currentPhoto.dataUrl,
        sceneToUse,
        50, // Default background value
        50, // Default lighting value
        50, // Default detail value
        100, // Default image size
        selectedAspectRatio // Pass the selected aspect ratio
      )
      
      setPreviewImage(previewDataUrl)
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [currentPhoto, sceneToUse, selectedAspectRatio])
  
  // Debounce the preview generation to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview()
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [selectedAspectRatio, generatePreview])
  
  const handleGenerate = async () => {
    if (!currentPhotoId || !sceneToUse || !currentPhoto) return
    
    try {
      // Generate portrait using AI service
      const result = await generatePortrait({
        photoDataUrl: currentPhoto.dataUrl,
        scene: sceneToUse,
        background: 50, // Default value
        lighting: 50,   // Default value
        detail: 50,     // Default value
        useKolors, // Pass the flag to use Kolors API
        style: selectedStyle // Pass the selected style
      })
      
      if (result) {
        setProcessingTime(result.processingTime)
        
        // Add generated portrait to store
        const portraitId = addGeneratedPortrait({
          originalPhotoId: currentPhotoId,
          scene: sceneToUse,
          dataUrl: result.portraitDataUrl,
          parameters: {
            background: 50, // Default value
            lighting: 50,   // Default value
            detail: 50,     // Default value
            useKolors,
            style: selectedStyle
          },
          kolorsId: result.kolorsId // Store the Kolors ID if available
        })
        
        // Navigate to result page after a short delay
        setTimeout(() => {
          router.push(`/preview-result?portrait=${portraitId}`)
        }, 500)
      }
    } catch (error) {
      console.error('Error generating portrait:', error)
    }
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
  
  // Get parameter tips based on scene
  const getParameterTips = () => {
    const scene = sceneToUse?.toLowerCase()
    switch (scene) {
      case 'professional':
        return {
          aspectRatio: 'Choose a square format for professional headshots'
        }
      case 'passport':
        return {
          aspectRatio: 'Use square format for passport photos'
        }
      case 'business':
        return {
          aspectRatio: 'Square format works best for business profiles'
        }
      case 'academic':
        return {
          aspectRatio: 'Square format is ideal for academic records'
        }
      case 'social':
        return {
          aspectRatio: 'Square format is perfect for social media profiles'
        }
      case 'wedding':
        return {
          aspectRatio: 'Widescreen format is great for wedding photos'
        }
      case 'student':
        return {
          aspectRatio: 'Square format is required for student IDs'
        }
      case 'virtual':
        return {
          aspectRatio: 'Widescreen format works best for virtual backgrounds'
        }
      default:
        return {
          aspectRatio: 'Choose the aspect ratio that best fits your needs'
        }
    }
  }
  
  const tips = getParameterTips()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Processing Overlay */}
      {isGenerating && (
        <ProcessingLoader 
          isProcessing={isGenerating} 
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
        <button 
          onClick={() => setShowTips(!showTips)}
          className="p-2 rounded-full hover:bg-gray-100 text-professional-blue"
        >
          <InformationCircleIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Tips Panel */}
        {showTips && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Tips for {getSceneTitle()} Portrait</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li><strong>Aspect Ratio:</strong> {tips.aspectRatio}</li>
            </ul>
          </div>
        )}
        
        {/* Error Message */}
        {generationError && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600">{generationError}</p>
              </div>
            </div>
          </div>
        )}
        
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
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                {getSceneTitle()} Preview
              </div>
            </div>
          )}
        </div>

        {/* SiliconFlow Kolors Option */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-blue-800">Generate with AI</h3>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={useKolors} 
                onChange={() => setUseKolors(!useKolors)} 
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {useKolors && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Select Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {kolorsStyles.map(style => (
                  <div 
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedStyle === style.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{style.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parameter Sliders */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {aspectRatios.map(ratio => (
                <div 
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedAspectRatio === ratio.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm text-gray-900">{ratio.name}</div>
                    {selectedAspectRatio === ratio.id && (
                      <CheckIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{ratio.description}</div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-gray-50 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Real-time Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              Real-time Preview
            </h3>
            <span className="text-xs text-gray-500">
              Updates as you adjust parameters
            </span>
          </div>
          
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden shadow-md relative">
            {isPreviewLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <svg className="animate-spin h-8 w-8 text-professional-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : previewImage ? (
              <img 
                src={previewImage} 
                alt="AI Preview" 
                className="w-full h-full object-cover"
              />
            ) : currentPhoto ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <p className="text-sm text-gray-500">Generating preview...</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <p className="text-sm text-gray-500">No photo selected</p>
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 text-white text-xs font-medium px-2 py-1 bg-black bg-opacity-50 rounded-full">
              AI Preview
            </div>
          </div>
          
          <div className="mt-2 text-xs text-center text-gray-500">
            This is how your final portrait will look with the current parameters
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !currentPhotoId || !sceneToUse}
            className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
              isGenerating || !currentPhotoId || !sceneToUse ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                {useKolors ? (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Generate with AI
                  </>
                ) : (
                  <>
                    Generate Portrait
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            This will generate a high-quality AI portrait based on your photo and selected parameters.
            {processingTime && (
              <span className="block mt-1">
                Last generation took {processingTime.toFixed(1)} seconds
              </span>
            )}
          </p>
        </div>
      </main>
    </div>
  )
} 