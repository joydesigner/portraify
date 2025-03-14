import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import useStore from '@/store/useStore'

export default function PreviewResult() {
  const router = useRouter()
  const { portrait: portraitId } = router.query
  
  const [activeTab, setActiveTab] = useState<'original' | 'generated'>('generated')
  const [showShareOptions, setShowShareOptions] = useState(false)
  
  // Get store data
  const generatedPortraits = useStore(state => state.generatedPortraits)
  const userPhotos = useStore(state => state.userPhotos)
  
  // Find the portrait data
  const portrait = portraitId 
    ? generatedPortraits.find(p => p.id === portraitId) 
    : generatedPortraits[0]
  
  // Find the original photo
  const originalPhoto = portrait 
    ? userPhotos.find(p => p.id === portrait.originalPhotoId) 
    : null
  
  // Redirect if no portrait is found
  useEffect(() => {
    if (!portrait && portraitId) {
      router.push('/scene-select')
    }
  }, [portrait, portraitId, router])
  
  // Get scene title for display
  const getSceneTitle = () => {
    if (!portrait) return 'Portrait'
    
    const scene = portrait.scene.toLowerCase()
    switch (scene) {
      case 'professional': return 'Professional'
      case 'passport': return 'Passport/Visa'
      case 'business': return 'Business Meeting'
      case 'academic': return 'Academic'
      case 'social': return 'Social Media'
      case 'wedding': return 'Wedding'
      case 'student': return 'Student/Work ID'
      case 'virtual': return 'Virtual Background'
      default: return 'Portrait'
    }
  }
  
  // Handle download (simulated)
  const handleDownload = () => {
    alert('Download functionality would be implemented here')
  }
  
  // Handle share (simulated)
  const handleShare = () => {
    setShowShareOptions(!showShareOptions)
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
          <Link href="/ai-params" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">Your {getSceneTitle()}</h1>
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
                <CheckIcon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1 text-professional-blue font-medium">Result</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <CheckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Portrait Generated Successfully!</h3>
              <p className="text-sm text-green-600">Your {getSceneTitle()} portrait is ready</p>
            </div>
          </div>
        </div>

        {/* Comparison Tabs */}
        <div className="mb-4">
          <div className="flex border-b">
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'generated' ? 'text-professional-blue border-b-2 border-professional-blue' : 'text-gray-500'}`}
              onClick={() => setActiveTab('generated')}
            >
              Generated Portrait
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'original' ? 'text-professional-blue border-b-2 border-professional-blue' : 'text-gray-500'}`}
              onClick={() => setActiveTab('original')}
            >
              Original Photo
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="relative w-full max-w-md aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-lg">
            {activeTab === 'generated' && portrait && (
              <img 
                src={portrait.dataUrl} 
                alt="Generated portrait" 
                className="w-full h-full object-cover"
              />
            )}
            
            {activeTab === 'original' && originalPhoto && (
              <img 
                src={originalPhoto.dataUrl} 
                alt="Original photo" 
                className="w-full h-full object-cover"
              />
            )}
            
            <div className="absolute bottom-4 left-4 text-white text-sm font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
              {activeTab === 'generated' ? getSceneTitle() : 'Original'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleDownload}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download
          </button>
          
          <div className="relative">
            <button 
              onClick={handleShare}
              className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
            >
              <ShareIcon className="h-5 w-5" />
              Share
            </button>
            
            {showShareOptions && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="grid grid-cols-4 gap-3">
                  {['Email', 'Message', 'Twitter', 'Facebook'].map((option) => (
                    <button 
                      key={option}
                      className="flex flex-col items-center"
                      onClick={() => alert(`Share via ${option}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                        <span className="text-xs">{option[0]}</span>
                      </div>
                      <span className="text-xs">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-auto">
          <Link href="/scene-select" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            Create Another Portrait
          </Link>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            Your portrait has been saved to your history
          </p>
        </div>
      </main>
    </div>
  )
} 