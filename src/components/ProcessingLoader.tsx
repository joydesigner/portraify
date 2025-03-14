import { useEffect, useState } from 'react'

interface ProcessingLoaderProps {
  isProcessing: boolean
  progress?: number
  text?: string
}

export default function ProcessingLoader({
  isProcessing,
  progress = -1,
  text = 'Processing...'
}: ProcessingLoaderProps) {
  const [dots, setDots] = useState('.')
  
  // Animate the dots
  useEffect(() => {
    if (!isProcessing) return
    
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.'
        return prev + '.'
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isProcessing])
  
  if (!isProcessing) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
        <div className="mb-4">
          <svg className="animate-spin h-12 w-12 text-professional-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {text}
          <span className="inline-block w-6 text-left">{dots}</span>
        </h3>
        
        {progress >= 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-professional-blue to-tech-purple"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{Math.round(progress)}% complete</p>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-3">
          This may take a few moments
        </p>
      </div>
    </div>
  )
} 