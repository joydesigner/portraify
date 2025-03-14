import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import SceneSelector from '@/components/SceneSelector'

// Define the scene types
const scenes = [
  {
    id: 'professional',
    title: 'Professional',
    description: 'Resume/LinkedIn profile photo',
    image: '/scenes/professional.jpg',
  },
  {
    id: 'passport',
    title: 'Passport/Visa',
    description: 'Official ID photo',
    image: '/scenes/passport.jpg',
  },
  {
    id: 'business',
    title: 'Business Meeting',
    description: 'Corporate appearance',
    image: '/scenes/business.jpg',
  },
  {
    id: 'academic',
    title: 'Academic',
    description: 'Conference presentation',
    image: '/scenes/academic.jpg',
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Profile picture optimization',
    image: '/scenes/social.jpg',
  },
  {
    id: 'wedding',
    title: 'Wedding',
    description: 'Invitation portrait',
    image: '/scenes/wedding.jpg',
  },
  {
    id: 'student',
    title: 'Student/Work ID',
    description: 'ID card photo',
    image: '/scenes/student.jpg',
  },
  {
    id: 'virtual',
    title: 'Virtual Background',
    description: 'Meeting background',
    image: '/scenes/virtual.jpg',
  },
]

export default function SceneSelect() {
  const router = useRouter()
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [showParams, setShowParams] = useState(false)

  const handleSceneSelect = (sceneId: string) => {
    setSelectedScene(sceneId)
    // Navigate to AI params page after a short delay
    setTimeout(() => {
      router.push(`/ai-params?scene=${sceneId}`)
    }, 300)
  }

  const handleLongPress = (sceneId: string) => {
    setSelectedScene(sceneId)
    setShowParams(true)
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
      <main className="flex-1 p-4">
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
      </main>
    </div>
  )
} 