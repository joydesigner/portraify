import Link from 'next/link'
import { ArrowRightIcon, CameraIcon, SparklesIcon, AdjustmentsHorizontalIcon, DocumentCheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'features'>('upload')

  return (
    <main className="min-h-screen flex flex-col">
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-professional-blue to-tech-purple text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Portraify</h1>
        <p className="text-lg opacity-90 max-w-md mx-auto">
          Transform your photos into professional portraits for any scenario
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'upload' ? 'text-professional-blue border-b-2 border-professional-blue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Get Started
        </button>
        <button 
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'features' ? 'text-professional-blue border-b-2 border-professional-blue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('features')}
        >
          Features
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 sm:p-8">
        {activeTab === 'upload' ? (
          <div className="max-w-md mx-auto">
            <div className="card p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <CameraIcon className="h-6 w-6 text-professional-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Upload Your Photo</h2>
                  <p className="text-gray-600 text-sm">Start by uploading a clear photo of your face</p>
                </div>
              </div>
              
              <Link href="/photo-upload" className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
                Start Now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="font-medium mb-3">Quick Access</h3>
              <nav className="space-y-2">
                <Link href="/scene-select" className="flex items-center p-3 rounded hover:bg-gray-50 transition">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Scene Selection</span>
                </Link>
                <Link href="/history" className="flex items-center p-3 rounded hover:bg-gray-50 transition">
                  <DocumentCheckIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span>History</span>
                </Link>
                <Link href="/settings" className="flex items-center p-3 rounded hover:bg-gray-50 transition">
                  <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Key Features</h2>
            
            <div className="space-y-4">
              <div className="card p-4 flex">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-4">
                  <SparklesIcon className="h-5 w-5 text-professional-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Professional Portraits</h3>
                  <p className="text-sm text-gray-600">Perfect for LinkedIn, resumes, and professional profiles</p>
                </div>
              </div>
              
              <div className="card p-4 flex">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-professional-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">ID Photos</h3>
                  <p className="text-sm text-gray-600">Passport, visa, and other official ID photos with correct specifications</p>
                </div>
              </div>
              
              <div className="card p-4 flex">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-professional-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Social Media</h3>
                  <p className="text-sm text-gray-600">Optimized portraits for social media profiles</p>
                </div>
              </div>
              
              <div className="card p-4 flex">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-4">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-professional-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Customizable</h3>
                  <p className="text-sm text-gray-600">Adjust background, lighting, and detail parameters</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/photo-upload" className="btn-primary w-full flex items-center justify-center gap-2">
                Try It Now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 