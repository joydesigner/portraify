import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

// Sample ID specifications data
const idSpecifications = {
  passport: {
    us: {
      title: 'US Passport',
      dimensions: '2 x 2 inches (51 x 51 mm)',
      background: 'White',
      requirements: [
        'Neutral facial expression',
        'Both eyes open',
        'No glasses',
        'Head centered and facing camera',
        'No head coverings (except religious)',
      ],
    },
    uk: {
      title: 'UK Passport',
      dimensions: '45 x 35 mm',
      background: 'Light grey or cream',
      requirements: [
        'Neutral expression',
        'Mouth closed',
        'Eyes open and visible',
        'Nothing covering face',
        'No shadows on face or background',
      ],
    },
    eu: {
      title: 'EU Passport',
      dimensions: '35 x 45 mm',
      background: 'White',
      requirements: [
        'Neutral expression',
        'Looking straight at camera',
        'No head coverings (except religious)',
        'No shadows',
        'No reflections on glasses',
      ],
    },
  },
  visa: {
    us: {
      title: 'US Visa',
      dimensions: '2 x 2 inches (51 x 51 mm)',
      background: 'White',
      requirements: [
        'Full face visible',
        'No glasses',
        'Neutral expression',
        'Head height between 1 inch and 1 3/8 inches',
      ],
    },
    schengen: {
      title: 'Schengen Visa',
      dimensions: '35 x 45 mm',
      background: 'White or off-white',
      requirements: [
        'Face should cover 70-80% of photo',
        'Neutral expression',
        'Looking straight at camera',
        'No head coverings (except religious)',
      ],
    },
  },
  student: {
    generic: {
      title: 'Student ID',
      dimensions: 'Varies by institution',
      background: 'White or blue',
      requirements: [
        'Clear face visibility',
        'Neutral expression recommended',
        'School-appropriate attire',
      ],
    },
  },
}

export default function IDSpecs() {
  const router = useRouter()
  const { type = 'passport', country = 'us' } = router.query
  
  const [selectedType, setSelectedType] = useState('passport')
  const [selectedCountry, setSelectedCountry] = useState('us')
  const [specifications, setSpecifications] = useState<any>(null)
  
  useEffect(() => {
    if (type && typeof type === 'string') {
      setSelectedType(type)
    }
    
    if (country && typeof country === 'string') {
      setSelectedCountry(country)
    }
  }, [type, country])
  
  useEffect(() => {
    // Get specifications based on selected type and country
    if (selectedType && selectedCountry) {
      const specs = idSpecifications[selectedType as keyof typeof idSpecifications]
      if (specs) {
        const countrySpecs = specs[selectedCountry as keyof typeof specs] || Object.values(specs)[0]
        setSpecifications(countrySpecs)
      }
    }
  }, [selectedType, selectedCountry])

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
          <Link href="/scene-select" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold ml-2">ID Specifications</h1>
        </div>
        <div className="flex items-center">
          <GlobeAltIcon className="h-6 w-6 text-gray-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Type Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">ID Type</h2>
          <div className="flex overflow-x-auto pb-2 -mx-1">
            {Object.keys(idSpecifications).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 mx-1 rounded-full whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-professional-blue text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Country Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Country</h2>
          <div className="flex overflow-x-auto pb-2 -mx-1">
            {selectedType && idSpecifications[selectedType as keyof typeof idSpecifications] && 
              Object.keys(idSpecifications[selectedType as keyof typeof idSpecifications]).map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 mx-1 rounded-full whitespace-nowrap ${
                    selectedCountry === country
                      ? 'bg-professional-blue text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {country.toUpperCase()}
                </button>
              ))
            }
          </div>
        </div>
        
        {/* Specifications */}
        {specifications && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{specifications.title}</h2>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
              <p className="text-lg">{specifications.dimensions}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Background</h3>
              <p className="text-lg">{specifications.background}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
              <ul className="space-y-2">
                {specifications.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-professional-blue text-white rounded-full flex-shrink-0 flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 