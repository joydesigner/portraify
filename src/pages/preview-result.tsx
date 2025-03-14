import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

export default function PreviewResult() {
  const router = useRouter()
  const [sliderPosition, setSliderPosition] = useState(50)
  const [selectedSize, setSelectedSize] = useState('original')
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(parseInt(e.target.value))
  }
  
  const handleDownload = () => {
    // In a real app, this would trigger the download of the generated image
    alert('Downloading portrait...')
  }
  
  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert('Sharing portrait...')
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
          <h1 className="text-xl font-semibold ml-2">Your Portrait</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="mb-4">
          <p className="text-gray-600">
            Compare your original photo with the AI-generated portrait.
          </p>
        </div>

        {/* Comparison Slider */}
        <div className="mb-6 aspect-w-1 aspect-h-1 bg-gray-200 rounded relative overflow-hidden">
          {/* Original Image (placeholder) */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* Generated Image (would be clipped based on slider) */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-professional-blue to-tech-purple"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <span className="text-white font-medium">AI Generated</span>
          </div>
          
          {/* Slider Divider */}
          <div 
            className="absolute inset-y-0 w-1 bg-white"
            style={{ left: `${sliderPosition}%` }}
          ></div>
          
          {/* Slider Control */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={handleSliderChange}
            className="absolute bottom-4 left-4 right-4 z-10"
          />
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Export Size</h2>
          <div className="grid grid-cols-3 gap-2">
            {['original', 'passport', 'linkedin'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`p-2 rounded border ${
                  selectedSize === size 
                    ? 'border-professional-blue bg-blue-50 text-professional-blue' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <Link 
            href="/scene-select" 
            className="btn border border-gray-300 bg-white text-gray-700 flex items-center justify-center"
          >
            Try Another Scene
          </Link>
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center justify-center gap-2"
          >
            Download
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  )
} 