import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, TrashIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import useStore from '@/store/useStore'

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
]

// Quality settings
const qualitySettings = [
  { id: 'low', name: 'Low', description: 'Faster processing, less detailed' },
  { id: 'medium', name: 'Medium', description: 'Balanced quality and speed' },
  { id: 'high', name: 'High', description: 'Best quality, slower processing' },
]

// Theme options
const themeOptions = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'System' },
]

export default function Settings() {
  const settings = useStore(state => state.settings)
  const updateSettings = useStore(state => state.updateSettings)
  const userPhotos = useStore(state => state.userPhotos)
  const generatedPortraits = useStore(state => state.generatedPortraits)
  const cleanupStorage = useStore(state => state.cleanupStorage)
  const deleteUserPhoto = useStore(state => state.deleteUserPhoto)
  const deleteGeneratedPortrait = useStore(state => state.deleteGeneratedPortrait)
  
  const [maxPhotos, setMaxPhotos] = useState(settings.maxStoredPhotos)
  const [maxPortraits, setMaxPortraits] = useState(settings.maxStoredPortraits)
  const [quality, setQuality] = useState(settings.quality)
  const [theme, setTheme] = useState(settings.theme)
  const [saveOriginals, setSaveOriginals] = useState(settings.saveOriginals)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showOptimizationInfo, setShowOptimizationInfo] = useState(false)
  
  // Calculate storage usage
  const calculateStorageUsage = () => {
    try {
      // Get the size of the localStorage
      let total = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ''
          total += key.length + value.length
        }
      }
      
      // Convert to KB
      return (total / 1024).toFixed(2)
    } catch (e) {
      console.error('Error calculating storage:', e)
      return '0'
    }
  }
  
  const [storageUsage, setStorageUsage] = useState('0')
  
  useEffect(() => {
    setStorageUsage(calculateStorageUsage())
  }, [userPhotos, generatedPortraits])
  
  const handleSaveSettings = () => {
    updateSettings({
      maxStoredPhotos: maxPhotos,
      maxStoredPortraits: maxPortraits,
      quality,
      theme,
      saveOriginals,
    })
    
    // Clean up storage based on new settings
    cleanupStorage()
    
    // Update storage usage
    setStorageUsage(calculateStorageUsage())
    
    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }
  
  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Clear all photos and portraits
      userPhotos.forEach(photo => deleteUserPhoto(photo.id))
      generatedPortraits.forEach(portrait => deleteGeneratedPortrait(portrait.id))
      
      // Update storage usage
      setStorageUsage(calculateStorageUsage())
      
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
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
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Settings Saved Successfully!</h3>
                <p className="text-sm text-green-600">Your changes have been applied</p>
              </div>
            </div>
          </div>
        )}

        {/* Storage Section */}
        <div className="card p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Storage Management</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Current storage usage: <span className="font-medium">{storageUsage} KB</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-professional-blue h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (parseFloat(storageUsage) / 5000) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Browser storage limit is approximately 5MB
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum stored photos ({maxPhotos})
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={maxPhotos}
              onChange={(e) => setMaxPhotos(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less storage (1)</span>
              <span>More photos (20)</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum stored portraits ({maxPortraits})
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={maxPortraits}
              onChange={(e) => setMaxPortraits(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less storage (1)</span>
              <span>More portraits (30)</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Image Quality
              </label>
              <button 
                onClick={() => setShowOptimizationInfo(!showOptimizationInfo)}
                className="text-professional-blue"
              >
                <InformationCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            {showOptimizationInfo && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <p className="mb-1"><strong>Low:</strong> Smaller file size, faster uploads, uses less storage (600px, 50% quality)</p>
                <p className="mb-1"><strong>Medium:</strong> Balanced quality and size (800px, 70% quality)</p>
                <p><strong>High:</strong> Best quality, larger file size, uses more storage (1200px, 90% quality)</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q as 'low' | 'medium' | 'high')}
                  className={`p-2 rounded border ${
                    quality === q 
                      ? 'border-professional-blue bg-blue-50 text-professional-blue' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher quality uses more storage
            </p>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveOriginals}
                onChange={(e) => setSaveOriginals(e.target.checked)}
                className="h-4 w-4 text-professional-blue focus:ring-professional-blue border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Save original photos</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Disable to save storage space
            </p>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-amber-800 mb-1">Storage Optimization Tips</h3>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Lower the image quality setting to reduce storage usage</li>
              <li>• Reduce the maximum number of stored photos and portraits</li>
              <li>• Disable "Save original photos" to only keep optimized versions</li>
              <li>• Delete unused portraits from your history</li>
            </ul>
          </div>
          
          <button
            onClick={handleClearAllData}
            className="flex items-center justify-center w-full p-2 mt-4 text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Clear All Data
          </button>
        </div>

        {/* App Settings */}
        <div className="card p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">App Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as 'light' | 'dark' | 'system')}
                  className={`p-2 rounded border ${
                    theme === t 
                      ? 'border-professional-blue bg-blue-50 text-professional-blue' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-auto">
          <button
            onClick={handleSaveSettings}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            Save Settings
          </button>
        </div>
      </main>
    </div>
  )
} 