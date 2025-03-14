import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import useStore from '@/store/useStore'
import Image from 'next/image'

export default function History() {
  const generatedPortraits = useStore(state => state.generatedPortraits)
  const userPhotos = useStore(state => state.userPhotos)
  const deleteGeneratedPortrait = useStore(state => state.deleteGeneratedPortrait)
  const deleteUserPhoto = useStore(state => state.deleteUserPhoto)
  
  const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null)
  
  // Get scene title for display
  const getSceneTitle = (scene: string) => {
    switch (scene.toLowerCase()) {
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
  
  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  // Handle download (simulated)
  const handleDownload = (portraitId: string) => {
    alert('Download functionality would be implemented here')
  }
  
  // Handle delete
  const handleDelete = (portraitId: string) => {
    if (confirm('Are you sure you want to delete this portrait?')) {
      deleteGeneratedPortrait(portraitId)
      setSelectedPortrait(null)
    }
  }
  
  // Sort portraits by date (newest first)
  const sortedPortraits = [...generatedPortraits].sort((a, b) => b.createdAt - a.createdAt)

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
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">History</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        {sortedPortraits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">No Portraits Yet</h2>
            <p className="text-gray-600 mb-6">
              Generate your first portrait to see it here
            </p>
            <Link href="/photo-upload" className="btn-primary px-6 py-2">
              Create a Portrait
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {sortedPortraits.map((portrait) => {
                const originalPhoto = userPhotos.find(p => p.id === portrait.originalPhotoId)
                return (
                  <div 
                    key={portrait.id}
                    onClick={() => setSelectedPortrait(portrait.id)}
                    className={`card overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedPortrait === portrait.id 
                        ? 'ring-2 ring-professional-blue scale-[1.02] shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative overflow-hidden">
                      <img 
                        src={portrait.dataUrl} 
                        alt={`Portrait ${getSceneTitle(portrait.scene)}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <div className="text-white text-xs font-medium">
                          {getSceneTitle(portrait.scene)}
                        </div>
                        <div className="text-white text-xs opacity-80">
                          {formatDate(portrait.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {selectedPortrait && (
              <div className="mt-6 card p-4">
                <h2 className="text-lg font-medium mb-4">Selected Portrait</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2 aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                    {sortedPortraits.find(p => p.id === selectedPortrait)?.dataUrl && (
                      <img 
                        src={sortedPortraits.find(p => p.id === selectedPortrait)?.dataUrl} 
                        alt="Selected portrait"
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="w-full sm:w-1/2">
                    <div className="mb-4">
                      <h3 className="font-medium">
                        {getSceneTitle(sortedPortraits.find(p => p.id === selectedPortrait)?.scene || '')} Portrait
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created on {formatDate(sortedPortraits.find(p => p.id === selectedPortrait)?.createdAt || 0)}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Parameters</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Background:</span>
                          <span>{sortedPortraits.find(p => p.id === selectedPortrait)?.parameters.background}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lighting:</span>
                          <span>{sortedPortraits.find(p => p.id === selectedPortrait)?.parameters.lighting}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Detail:</span>
                          <span>{sortedPortraits.find(p => p.id === selectedPortrait)?.parameters.detail}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDownload(selectedPortrait)}
                        className="btn-secondary flex items-center justify-center gap-1 py-2"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(selectedPortrait)}
                        className="flex items-center justify-center gap-1 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
} 