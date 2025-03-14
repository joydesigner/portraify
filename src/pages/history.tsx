import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

// Sample history data
const historyItems = [
  {
    id: 'hist-1',
    date: 'Today, 2:30 PM',
    scene: 'Professional',
    thumbnail: '/scenes/professional.jpg',
    tags: ['LinkedIn', 'Resume'],
  },
  {
    id: 'hist-2',
    date: 'Today, 11:15 AM',
    scene: 'Passport',
    thumbnail: '/scenes/passport.jpg',
    tags: ['US Visa', 'Official'],
  },
  {
    id: 'hist-3',
    date: 'Yesterday',
    scene: 'Business Meeting',
    thumbnail: '/scenes/business.jpg',
    tags: ['Corporate', 'Formal'],
  },
  {
    id: 'hist-4',
    date: 'May 15, 2023',
    scene: 'Social Media',
    thumbnail: '/scenes/social.jpg',
    tags: ['Instagram', 'Profile'],
  },
  {
    id: 'hist-5',
    date: 'May 10, 2023',
    scene: 'Academic',
    thumbnail: '/scenes/academic.jpg',
    tags: ['Conference', 'Presentation'],
  },
]

export default function History() {
  const router = useRouter()
  const [items, setItems] = useState(historyItems)
  
  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }
  
  const handleDownload = (id: string) => {
    // In a real app, this would download the image
    alert(`Downloading portrait ${id}...`)
  }
  
  const handleItemClick = (id: string) => {
    // In a real app, this would navigate to the preview page for this item
    router.push(`/preview-result?id=${id}`)
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
          <h1 className="text-xl font-semibold ml-2">History</h1>
        </div>
        {items.length > 0 && (
          <button 
            onClick={() => setItems([])}
            className="text-red-500 text-sm"
          >
            Clear All
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">No History Yet</h2>
            <p className="text-gray-500 mb-6">
              Your generated portraits will appear here.
            </p>
            <Link href="/photo-upload" className="btn-primary">
              Create Your First Portrait
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex overflow-hidden">
                {/* Thumbnail */}
                <div 
                  className="w-24 h-24 bg-gray-200 flex-shrink-0 cursor-pointer"
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 
                        className="font-medium cursor-pointer"
                        onClick={() => handleItemClick(item.id)}
                      >
                        {item.scene}
                      </h3>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => handleDownload(item.id)}
                      className="p-1.5 text-gray-500 hover:text-professional-blue"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 ml-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 