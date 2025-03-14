import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface Scene {
  id: string
  title: string
  description: string
  image: string
}

interface SceneSelectorProps {
  scenes: Scene[]
  onSelect: (sceneId: string) => void
  onLongPress?: (sceneId: string) => void
  selectedScene: string | null
}

export default function SceneSelector({ 
  scenes, 
  onSelect, 
  onLongPress, 
  selectedScene 
}: SceneSelectorProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  
  // Track which images have loaded
  const handleImageLoad = useCallback((sceneId: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [sceneId]: true
    }))
  }, [])
  
  const handlePressStart = useCallback((sceneId: string) => {
    setIsLongPress(false)
    
    // Start a timer for long press detection
    const timer = setTimeout(() => {
      setIsLongPress(true)
      if (onLongPress) {
        onLongPress(sceneId)
      }
    }, 500) // 500ms for long press
    
    setPressTimer(timer)
  }, [onLongPress])
  
  const handlePressEnd = useCallback((sceneId: string) => {
    // Clear the timer
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    
    // If it wasn't a long press, treat as a normal click
    if (!isLongPress) {
      onSelect(sceneId)
    }
  }, [isLongPress, onSelect, pressTimer])

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {scenes.map((scene) => (
        <motion.div
          key={scene.id}
          whileTap={{ scale: 0.95 }}
          onTouchStart={() => handlePressStart(scene.id)}
          onTouchEnd={() => handlePressEnd(scene.id)}
          onMouseDown={() => handlePressStart(scene.id)}
          onMouseUp={() => handlePressEnd(scene.id)}
          onMouseLeave={() => {
            if (pressTimer) {
              clearTimeout(pressTimer)
              setPressTimer(null)
            }
          }}
          className={`card overflow-hidden cursor-pointer transition-all duration-200 ${
            selectedScene === scene.id 
              ? 'ring-2 ring-professional-blue scale-[1.02] shadow-lg' 
              : 'hover:shadow-md'
          }`}
        >
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative overflow-hidden">
            {/* Placeholder shown until image loads */}
            {!loadedImages[scene.id] && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 animate-pulse">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Actual image */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${loadedImages[scene.id] ? 'opacity-100' : 'opacity-0'}`}>
              <Image 
                src={scene.image} 
                alt={scene.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                onLoad={() => handleImageLoad(scene.id)}
                priority={scene.id === 'professional' || scene.id === 'passport'}
              />
            </div>
            
            {/* Selection indicator */}
            {selectedScene === scene.id && (
              <div className="absolute top-2 right-2 bg-professional-blue rounded-full p-1 shadow-md">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-medium">{scene.title}</h3>
            <p className="text-xs text-gray-500">{scene.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 