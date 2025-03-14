import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [quality, setQuality] = useState('medium')
  const [theme, setTheme] = useState('system')
  const [notifications, setNotifications] = useState(true)
  const [saveOriginals, setSaveOriginals] = useState(true)
  
  const handleSave = () => {
    // In a real app, this would save settings to local storage or a backend
    alert('Settings saved!')
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
        <button 
          onClick={handleSave}
          className="text-professional-blue font-medium"
        >
          Save
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Language Settings */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Language</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-50"
                >
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <CheckIcon className="h-5 w-5 text-professional-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quality Settings */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Quality</h2>
            <div className="space-y-2">
              {qualitySettings.map((setting) => (
                <button
                  key={setting.id}
                  onClick={() => setQuality(setting.id)}
                  className={`w-full flex items-center justify-between p-3 rounded ${
                    quality === setting.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <div className={quality === setting.id ? 'text-professional-blue font-medium' : ''}>
                      {setting.name}
                    </div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </div>
                  {quality === setting.id && (
                    <CheckIcon className="h-5 w-5 text-professional-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Theme</h2>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`p-2 rounded border ${
                    theme === option.id 
                      ? 'border-professional-blue bg-blue-50 text-professional-blue' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Other Settings */}
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Other Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="notifications" className="flex-1">
                  <span className="block font-medium">Notifications</span>
                  <span className="block text-sm text-gray-500">Get updates about new features</span>
                </label>
                <div className="ml-4">
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-professional-blue' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="saveOriginals" className="flex-1">
                  <span className="block font-medium">Save Original Photos</span>
                  <span className="block text-sm text-gray-500">Keep uploaded photos in history</span>
                </label>
                <div className="ml-4">
                  <button
                    onClick={() => setSaveOriginals(!saveOriginals)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      saveOriginals ? 'bg-professional-blue' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        saveOriginals ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="card">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <div className="text-sm text-gray-500">
              <p>Portraify v1.0.0</p>
              <p className="mt-1">© 2023 Portraify Inc.</p>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="#" className="block text-professional-blue">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-professional-blue">
                Terms of Service
              </Link>
              <button className="block text-red-500">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 