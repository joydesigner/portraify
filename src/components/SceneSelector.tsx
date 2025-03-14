import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

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
          className={`card overflow-hidden cursor-pointer ${
            selectedScene === scene.id ? 'ring-2 ring-professional-blue' : ''
          }`}
        >
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {/* Placeholder for image */}
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {/* We would load actual images here in production */}
            {/* <img src={scene.image} alt={scene.title} className="absolute inset-0 w-full h-full object-cover" /> */}
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