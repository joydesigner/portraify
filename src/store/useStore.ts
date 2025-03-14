import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPhoto {
  id: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
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
  }
  createdAt: number
}

interface AppState {
  // User photos
  userPhotos: UserPhoto[]
  currentPhotoId: string | null
  addUserPhoto: (photo: Omit<UserPhoto, 'id' | 'createdAt'>) => string
  setCurrentPhoto: (id: string | null) => void
  deleteUserPhoto: (id: string) => void
  
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
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // Subscription
  subscription: {
    plan: 'free' | 'pro' | 'unlimited'
    expiresAt: number | null
  }
  updateSubscription: (subscription: Partial<AppState['subscription']>) => void
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Create the store
const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User photos
      userPhotos: [],
      currentPhotoId: null,
      addUserPhoto: (photo) => {
        const id = generateId()
        set((state) => ({
          userPhotos: [
            ...state.userPhotos,
            {
              ...photo,
              id,
              createdAt: Date.now(),
            },
          ],
          currentPhotoId: id,
        }))
        return id
      },
      setCurrentPhoto: (id) => set({ currentPhotoId: id }),
      deleteUserPhoto: (id) => set((state) => ({
        userPhotos: state.userPhotos.filter((photo) => photo.id !== id),
        currentPhotoId: state.currentPhotoId === id ? null : state.currentPhotoId,
      })),
      
      // Generated portraits
      generatedPortraits: [],
      addGeneratedPortrait: (portrait) => {
        const id = generateId()
        set((state) => ({
          generatedPortraits: [
            ...state.generatedPortraits,
            {
              ...portrait,
              id,
              createdAt: Date.now(),
            },
          ],
        }))
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
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      })),
      
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
    }),
    {
      name: 'portraify-storage',
      partialize: (state) => ({
        userPhotos: state.userPhotos,
        generatedPortraits: state.generatedPortraits,
        settings: state.settings,
        subscription: state.subscription,
      }),
    }
  )
)

export default useStore 