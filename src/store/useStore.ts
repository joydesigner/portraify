import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
import { autoOptimizeImage, estimateDataUrlSize } from '@/utils/imageUtils'

interface UserPhoto {
  id: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
  sizeKB?: number
  originalDataUrl?: string // Store original if saveOriginals is true
}

interface GeneratedPortrait {
  id: string
  originalPhotoId: string
  scene: string
  dataUrl: string
  parameters: {
    background: number
    lighting: number
    detail: number
    useKolors?: boolean
    style?: string
    resolution?: string
  }
  createdAt: number
  sizeKB?: number
  kolorsId?: string // ID from Kolors API if used
}

interface AppState {
  // User photos
  userPhotos: UserPhoto[]
  currentPhotoId: string | null
  addUserPhoto: (photo: Omit<UserPhoto, 'id' | 'createdAt'>) => string
  setCurrentPhoto: (id: string | null) => void
  deleteUserPhoto: (id: string) => void
  
  // Scene selection
  currentScene: string | null
  setSceneType: (scene: string) => void
  
  // Generated portraits
  generatedPortraits: GeneratedPortrait[]
  addGeneratedPortrait: (portrait: Omit<GeneratedPortrait, 'id' | 'createdAt'>) => string
  deleteGeneratedPortrait: (id: string) => void
  
  // App settings
  settings: {
    language: string
    quality: 'low' | 'medium' | 'high'
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    saveOriginals: boolean
    maxStoredPhotos: number
    maxStoredPortraits: number
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // Subscription
  subscription: {
    plan: 'free' | 'pro' | 'unlimited'
    expiresAt: number | null
  }
  updateSubscription: (subscription: Partial<AppState['subscription']>) => void
  
  // Storage management
  cleanupStorage: () => void
  getStorageUsage: () => number
  optimizeExistingPhotos: () => Promise<void>
  clearAllData: () => void
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Custom storage with compression
const compressedStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    try {
      const decompressed = decompressFromUTF16(str)
      return decompressed
    } catch (e) {
      // If decompression fails, it might be uncompressed data
      return str
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const compressed = compressToUTF16(value)
      localStorage.setItem(name, compressed)
    } catch (e) {
      console.error('Storage error:', e)
      // If we hit quota error, clean up old data
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert('Storage limit reached. Some older portraits have been removed to make space.')
        
        // Try to clear some space by removing old items directly from localStorage
        try {
          const currentStore = localStorage.getItem(name)
          if (currentStore) {
            try {
              const data = JSON.parse(decompressFromUTF16(currentStore) || currentStore)
              if (data.state && data.state.generatedPortraits && Array.isArray(data.state.generatedPortraits)) {
                // Keep only the 5 most recent portraits
                data.state.generatedPortraits = data.state.generatedPortraits
                  .sort((a: GeneratedPortrait, b: GeneratedPortrait) => b.createdAt - a.createdAt)
                  .slice(0, 5)
                
                // Save the cleaned up data
                const compressed = compressToUTF16(JSON.stringify(data))
                localStorage.setItem(name, compressed)
              }
            } catch (parseError) {
              console.error('Error parsing store data:', parseError)
            }
          }
        } catch (clearError) {
          console.error('Error clearing space:', clearError)
          // Last resort: clear everything
          localStorage.clear()
        }
      }
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  }
}

// Get quality settings based on quality level
const getQualitySettings = (quality: 'low' | 'medium' | 'high') => {
  switch (quality) {
    case 'low':
      return { quality: 0.5, maxWidth: 600 }
    case 'high':
      return { quality: 0.9, maxWidth: 1200 }
    case 'medium':
    default:
      return { quality: 0.7, maxWidth: 800 }
  }
}

// Create the store
const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User photos
      userPhotos: [],
      currentPhotoId: null,
      addUserPhoto: (photo) => {
        const id = generateId()
        
        // Process the photo based on quality settings
        const processPhoto = async () => {
          const { quality } = get().settings
          const qualitySettings = getQualitySettings(quality)
          const saveOriginals = get().settings.saveOriginals
          
          // Store original if saveOriginals is true
          const originalDataUrl = saveOriginals ? photo.dataUrl : undefined
          
          // Optimize the photo
          try {
            const optimizedDataUrl = await autoOptimizeImage(
              photo.dataUrl, 
              { quality: qualitySettings.quality, maxWidth: qualitySettings.maxWidth }
            )
            
            // Estimate size
            const sizeKB = estimateDataUrlSize(optimizedDataUrl)
            
            set((state) => {
              // Get current photos and add the new one
              const newPhotos = [
                ...state.userPhotos,
                {
                  ...photo,
                  dataUrl: optimizedDataUrl,
                  id,
                  createdAt: Date.now(),
                  sizeKB,
                  originalDataUrl
                },
              ]
              
              // Limit the number of stored photos
              const maxPhotos = state.settings.maxStoredPhotos
              const sortedPhotos = newPhotos
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, maxPhotos)
              
              return {
                userPhotos: sortedPhotos,
                currentPhotoId: id,
              }
            })
          } catch (error) {
            console.error('Error optimizing photo:', error)
            
            // Fallback to original if optimization fails
            set((state) => {
              const sizeKB = estimateDataUrlSize(photo.dataUrl)
              const newPhotos = [
                ...state.userPhotos,
                {
                  ...photo,
                  id,
                  createdAt: Date.now(),
                  sizeKB,
                  originalDataUrl: saveOriginals ? photo.dataUrl : undefined
                },
              ]
              
              const maxPhotos = state.settings.maxStoredPhotos
              const sortedPhotos = newPhotos
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, maxPhotos)
              
              return {
                userPhotos: sortedPhotos,
                currentPhotoId: id,
              }
            })
          }
          
          // Clean up storage if needed
          setTimeout(() => get().cleanupStorage(), 100)
        }
        
        // Start processing
        processPhoto()
        
        return id
      },
      setCurrentPhoto: (id) => set({ currentPhotoId: id }),
      deleteUserPhoto: (id) => set((state) => ({
        userPhotos: state.userPhotos.filter((photo) => photo.id !== id),
        currentPhotoId: state.currentPhotoId === id ? null : state.currentPhotoId,
      })),
      
      // Scene selection
      currentScene: null,
      setSceneType: (scene) => set({ currentScene: scene }),
      
      // Generated portraits
      generatedPortraits: [],
      addGeneratedPortrait: (portrait) => {
        const id = generateId()
        
        // Process the portrait
        const processPortrait = async () => {
          try {
            // Estimate size
            const sizeKB = estimateDataUrlSize(portrait.dataUrl)
            
            set((state) => {
              // Get current portraits and add the new one
              const newPortraits = [
                ...state.generatedPortraits,
                {
                  ...portrait,
                  id,
                  createdAt: Date.now(),
                  sizeKB
                },
              ]
              
              // Limit the number of stored portraits
              const maxPortraits = state.settings.maxStoredPortraits
              const sortedPortraits = newPortraits
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, maxPortraits)
              
              return {
                generatedPortraits: sortedPortraits,
              }
            })
          } catch (error) {
            console.error('Error processing portrait:', error)
            
            // Fallback if processing fails
            set((state) => {
              const newPortraits = [
                ...state.generatedPortraits,
                {
                  ...portrait,
                  id,
                  createdAt: Date.now(),
                },
              ]
              
              const maxPortraits = state.settings.maxStoredPortraits
              const sortedPortraits = newPortraits
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, maxPortraits)
              
              return {
                generatedPortraits: sortedPortraits,
              }
            })
          }
          
          // Clean up storage if needed
          setTimeout(() => get().cleanupStorage(), 100)
        }
        
        // Start processing
        processPortrait()
        
        return id
      },
      deleteGeneratedPortrait: (id) => set((state) => ({
        generatedPortraits: state.generatedPortraits.filter((portrait) => portrait.id !== id),
      })),
      
      // App settings
      settings: {
        language: 'en',
        quality: 'medium',
        theme: 'system',
        notifications: true,
        saveOriginals: true,
        maxStoredPhotos: 10,
        maxStoredPortraits: 20,
      },
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }))
        
        // If quality settings changed, optimize existing photos
        if (newSettings.quality) {
          setTimeout(() => get().optimizeExistingPhotos(), 100)
        }
      },
      
      // Subscription
      subscription: {
        plan: 'free',
        expiresAt: null,
      },
      updateSubscription: (newSubscription) => set((state) => ({
        subscription: {
          ...state.subscription,
          ...newSubscription,
        },
      })),
      
      // Storage management
      cleanupStorage: () => {
        set((state) => {
          // Keep only the most recent photos and portraits
          const maxPhotos = state.settings.maxStoredPhotos
          const maxPortraits = state.settings.maxStoredPortraits
          
          const sortedPhotos = [...state.userPhotos]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, maxPhotos)
          
          const sortedPortraits = [...state.generatedPortraits]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, maxPortraits)
          
          return {
            userPhotos: sortedPhotos,
            generatedPortraits: sortedPortraits,
          }
        })
      },
      
      // Clear all user data while preserving settings
      clearAllData: () => {
        set((state) => ({
          userPhotos: [],
          currentPhotoId: null,
          currentScene: null,
          generatedPortraits: []
        }))
      },
      
      // Calculate total storage usage in KB
      getStorageUsage: () => {
        const state = get()
        let totalSize = 0
        
        // Add size of user photos
        state.userPhotos.forEach(photo => {
          if (photo.sizeKB) {
            totalSize += photo.sizeKB
          } else {
            totalSize += estimateDataUrlSize(photo.dataUrl)
          }
          
          // Add size of original photos if saved
          if (photo.originalDataUrl) {
            totalSize += estimateDataUrlSize(photo.originalDataUrl)
          }
        })
        
        // Add size of generated portraits
        state.generatedPortraits.forEach(portrait => {
          if (portrait.sizeKB) {
            totalSize += portrait.sizeKB
          } else {
            totalSize += estimateDataUrlSize(portrait.dataUrl)
          }
        })
        
        return totalSize
      },
      
      // Optimize existing photos based on current quality settings
      optimizeExistingPhotos: async () => {
        const state = get()
        const { quality, saveOriginals } = state.settings
        const qualitySettings = getQualitySettings(quality)
        
        // Only optimize if we have photos
        if (state.userPhotos.length === 0) return
        
        // Process each photo
        const optimizedPhotos = await Promise.all(
          state.userPhotos.map(async (photo) => {
            // Skip if no original to optimize from
            if (!photo.originalDataUrl && !saveOriginals) {
              return photo
            }
            
            try {
              // Use original if available, otherwise use current
              const sourceDataUrl = photo.originalDataUrl || photo.dataUrl
              
              // Optimize the photo
              const optimizedDataUrl = await autoOptimizeImage(
                sourceDataUrl,
                { quality: qualitySettings.quality, maxWidth: qualitySettings.maxWidth }
              )
              
              // Estimate size
              const sizeKB = estimateDataUrlSize(optimizedDataUrl)
              
              return {
                ...photo,
                dataUrl: optimizedDataUrl,
                sizeKB
              }
            } catch (error) {
              console.error('Error optimizing existing photo:', error)
              return photo
            }
          })
        )
        
        // Update the store with optimized photos
        set({ userPhotos: optimizedPhotos })
      }
    }),
    {
      name: 'portraify-storage',
      storage: createJSONStorage(() => compressedStorage),
      partialize: (state) => ({
        userPhotos: state.userPhotos,
        currentPhotoId: state.currentPhotoId,
        currentScene: state.currentScene,
        generatedPortraits: state.generatedPortraits,
        settings: state.settings,
        subscription: state.subscription,
      }),
    }
  )
)

export default useStore 