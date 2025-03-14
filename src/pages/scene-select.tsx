import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, AdjustmentsHorizontalIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import SceneSelector from '@/components/SceneSelector'
import useStore from '@/store/useStore'

// Define the scene types
const scenes = [
  {
    id: 'professional',
    title: 'Professional',
    description: 'Resume/LinkedIn profile photo',
    image: '/scenes/professional.svg',
  },
  {
    id: 'passport',
    title: 'Passport/Visa',
    description: 'Official ID photo',
    image: '/scenes/passport.svg',
  },
  {
    id: 'business',
    title: 'Business Meeting',
    description: 'Corporate appearance',
    image: '/scenes/business.svg',
  },
  {
    id: 'academic',
    title: 'Academic',
    description: 'Conference presentation',
    image: '/scenes/academic.svg',
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Profile picture optimization',
    image: '/scenes/social.svg',
  },
  {
    id: 'wedding',
    title: 'Wedding',
    description: 'Invitation portrait',
    image: '/scenes/wedding.svg',
  },
  {
    id: 'student',
    title: 'Student/Work ID',
    description: 'ID card photo',
    image: '/scenes/student.svg',
  },
  {
    id: 'virtual',
    title: 'Virtual Background',
    description: 'Meeting background',
    image: '/scenes/virtual.svg',
  },
]

export default function SceneSelect() {
  const router = useRouter()
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [showParams, setShowParams] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Get store data
  const currentPhotoId = useStore(state => state.currentPhotoId)
  const userPhotos = useStore(state => state.userPhotos)
  const setSceneType = useStore(state => state.setSceneType)
  
  // Check if we have a photo to work with
  useEffect(() => {
    if (!currentPhotoId) {
      // Redirect to photo upload if no photo is selected
      router.push('/photo-upload')
    }
  }, [currentPhotoId, router])
  
  // Get the current photo data
  const currentPhoto = userPhotos.find(photo => photo.id === currentPhotoId)

  const handleSceneSelect = (sceneId: string) => {
    setSelectedScene(sceneId)
    setIsNavigating(true)
    
    // Save the selected scene to the store
    setSceneType(sceneId)
    
    // Navigate to AI params page after a short delay
    setTimeout(() => {
      router.push(`/ai-params?scene=${sceneId}`)
    }, 300)
  }

  const handleLongPress = (sceneId: string) => {
    setSelectedScene(sceneId)
    setShowParams(true)
    
    // Save the selected scene to the store
    setSceneType(sceneId)
    
    // Navigate to AI params page after a short delay
    setTimeout(() => {
      router.push(`/ai-params?scene=${sceneId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen flex flex-col">
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
          <Link href="/photo-upload" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">Select Scene</h1>
        </div>
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => router.push('/ai-params')}
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" />
        </button>
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
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs mt-1 text-professional-blue font-medium">Scene</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs mt-1 text-gray-500">Result</span>
            </div>
          </div>
        </div>

        {/* Photo Preview */}
        {currentPhoto && (
          <div className="mb-6 flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-professional-blue">
              <img 
                src={currentPhoto.dataUrl} 
                alt="Your photo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-medium">Step 2: Choose a Scene</h2>
              <p className="text-gray-600 text-sm">
                Select the type of portrait you want to generate
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600">
            Choose a scene for your portrait. Long press for quick parameter adjustments.
          </p>
        </div>

        <SceneSelector 
          scenes={scenes} 
          onSelect={handleSceneSelect} 
          onLongPress={handleLongPress}
          selectedScene={selectedScene}
        />
        
        {/* Navigation Button */}
        <div className="mt-6">
          <button
            onClick={() => selectedScene && handleSceneSelect(selectedScene)}
            disabled={!selectedScene || isNavigating}
            className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
              !selectedScene || isNavigating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isNavigating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Continue to Adjust Parameters
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
} 