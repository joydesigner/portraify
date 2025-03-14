import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

export default function AIParams() {
  const router = useRouter()
  const { scene } = router.query
  
  const [background, setBackground] = useState(50)
  const [lighting, setLighting] = useState(50)
  const [detail, setDetail] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Set default values based on scene
  useEffect(() => {
    if (scene) {
      switch (scene) {
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
        // Add other scenes with their default values
        default:
          setBackground(50)
          setLighting(50)
          setDetail(50)
      }
    }
  }, [scene])
  
  const handleGenerate = () => {
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      router.push('/preview-result')
    }, 2000)
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
          <Link href="/scene-select" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">AI Parameters</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="mb-6">
          <p className="text-gray-600">
            Adjust parameters to customize your portrait for {scene || 'selected'} scene.
          </p>
        </div>

        {/* Preview Canvas */}
        <div className="mb-6 aspect-w-1 aspect-h-1 bg-gray-200 rounded relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {/* WebGL preview would be implemented here */}
        </div>

        {/* Parameter Sliders */}
        <div className="space-y-6 mb-8">
          <div>
            <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
              Background ({background}%)
            </label>
            <input
              type="range"
              id="background"
              min="0"
              max="100"
              value={background}
              onChange={(e) => setBackground(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="lighting" className="block text-sm font-medium text-gray-700 mb-1">
              Lighting ({lighting}%)
            </label>
            <input
              type="range"
              id="lighting"
              min="0"
              max="100"
              value={lighting}
              onChange={(e) => setLighting(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="detail" className="block text-sm font-medium text-gray-700 mb-1">
              Detail Level ({detail}%)
            </label>
            <input
              type="range"
              id="detail"
              min="0"
              max="100"
              value={detail}
              onChange={(e) => setDetail(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
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
        </div>
      </main>
    </div>
  )
} 