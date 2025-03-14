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
  
  const [background, setBackground] = useState(50)
  const [lighting, setLighting] = useState(50)
  const [detail, setDetail] = useState(50)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [useKolors, setUseKolors] = useState(true) // Default to using Kolors
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(undefined)
  
  // Available Kolors styles
  const kolorsStyles = [
    { id: 'natural', name: '自然风格', description: '保持自然外观的肖像' },
    { id: 'professional', name: '专业风格', description: '适合商务和职业场合' },
    { id: 'artistic', name: '艺术风格', description: '增强色彩和艺术效果' },
    { id: 'dramatic', name: '戏剧风格', description: '强烈的光影对比' },
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
          setBackground(70)
          setLighting(60)
          setDetail(80)
          setSelectedStyle('professional')
          break
        case 'passport':
          setBackground(100)
          setLighting(50)
          setDetail(40)
          setSelectedStyle('natural')
          break
        case 'business':
          setBackground(60)
          setLighting(70)
          setDetail(60)
          setSelectedStyle('professional')
          break
        case 'academic':
          setBackground(65)
          setLighting(55)
          setDetail(70)
          setSelectedStyle('natural')
          break
        case 'social':
          setBackground(40)
          setLighting(75)
          setDetail(65)
          setSelectedStyle('artistic')
          break
        case 'wedding':
          setBackground(30)
          setLighting(80)
          setDetail(90)
          setSelectedStyle('dramatic')
          break
        case 'student':
          setBackground(90)
          setLighting(50)
          setDetail(40)
          setSelectedStyle('natural')
          break
        case 'virtual':
          setBackground(20)
          setLighting(60)
          setDetail(50)
          setSelectedStyle('artistic')
          break
        default:
          setBackground(50)
          setLighting(50)
          setDetail(50)
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
        background,
        lighting,
        detail
      )
      
      setPreviewImage(previewDataUrl)
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [currentPhoto, sceneToUse, background, lighting, detail])
  
  // Debounce the preview generation to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview()
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [background, lighting, detail, generatePreview])
  
  const handleGenerate = async () => {
    if (!currentPhotoId || !sceneToUse || !currentPhoto) return
    
    try {
      // Generate portrait using AI service
      const result = await generatePortrait({
        photoDataUrl: currentPhoto.dataUrl,
        scene: sceneToUse,
        background,
        lighting,
        detail,
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
            background,
            lighting,
            detail,
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
          background: 'Higher values create a more formal office background',
          lighting: 'Medium values provide professional studio lighting',
          detail: 'Higher values enhance facial features and clothing details'
        }
      case 'passport':
        return {
          background: 'Maximum value ensures a plain white background required for official documents',
          lighting: 'Medium values provide even lighting with no shadows',
          detail: 'Lower values create a smoother appearance that meets requirements'
        }
      case 'business':
        return {
          background: 'Higher values create a corporate office environment',
          lighting: 'Higher values create dramatic lighting for impact',
          detail: 'Medium values balance natural appearance with professionalism'
        }
      case 'academic':
        return {
          background: 'Higher values create a scholarly environment',
          lighting: 'Medium values provide balanced, natural lighting',
          detail: 'Higher values enhance academic attire and facial features'
        }
      case 'social':
        return {
          background: 'Lower values create trendy, blurred backgrounds',
          lighting: 'Higher values create vibrant, eye-catching lighting',
          detail: 'Higher values enhance features for social media appeal'
        }
      case 'wedding':
        return {
          background: 'Lower values create soft, romantic backgrounds',
          lighting: 'Higher values create warm, glowing lighting',
          detail: 'Maximum values capture all the special details'
        }
      case 'student':
        return {
          background: 'Higher values create a plain, compliant background',
          lighting: 'Medium values provide even, shadow-free lighting',
          detail: 'Lower values create a standard ID photo appearance'
        }
      case 'virtual':
        return {
          background: 'Lower values create tech-themed backgrounds',
          lighting: 'Medium values provide balanced screen-friendly lighting',
          detail: 'Medium values ensure clarity on video calls'
        }
      default:
        return {
          background: 'Adjust to change background appearance',
          lighting: 'Adjust to change lighting effects',
          detail: 'Adjust to change detail level'
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
              <li><strong>Background:</strong> {tips.background}</li>
              <li><strong>Lighting:</strong> {tips.lighting}</li>
              <li><strong>Detail:</strong> {tips.detail}</li>
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

        {/* SiliconFlow Kolors Option */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-blue-800">SiliconFlow Kolors AI</h3>
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
          
          <p className="text-sm text-blue-700 mb-3">
            使用SiliconFlow的Kolors AI模型生成更高质量的专业肖像。
          </p>
          
          {useKolors && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                选择风格
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
                    Generate with Kolors AI
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