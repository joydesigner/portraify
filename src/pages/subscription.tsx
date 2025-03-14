import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

// Define subscription plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '3 AI portraits per month',
      'Basic scenes only',
      'Standard quality',
      'Watermarked exports',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    features: [
      '20 AI portraits per month',
      'All scenes',
      'HD quality',
      'No watermarks',
      'Priority processing',
    ],
    cta: 'Upgrade',
    popular: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$19.99',
    period: 'per month',
    features: [
      'Unlimited AI portraits',
      'All scenes + exclusive ones',
      'Ultra HD quality',
      'No watermarks',
      'Priority processing',
      'Custom backgrounds',
    ],
    cta: 'Upgrade',
  },
]

export default function Subscription() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('free')
  
  const handleUpgrade = (planId: string) => {
    // In a real app, this would navigate to a payment page
    alert(`Upgrading to ${planId} plan...`)
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
      <header className="p-4 flex items-center">
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Subscription Plans</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-gray-600">
            Choose a plan that works for you. Upgrade anytime to unlock more features.
          </p>
        </div>

        <div className="space-y-4">
          {subscriptionPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`card relative overflow-hidden transition-all ${
                plan.popular ? 'border-2 border-professional-blue' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-professional-blue text-white text-xs px-3 py-1 rounded-bl">
                  Popular
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <div className="mt-1 mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => !plan.disabled && handleUpgrade(plan.id)}
                  disabled={plan.disabled}
                  className={`w-full py-2 rounded font-medium ${
                    plan.disabled
                      ? 'bg-gray-100 text-gray-500'
                      : plan.popular
                        ? 'bg-gradient-to-r from-professional-blue to-tech-purple text-white'
                        : 'bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All plans include a 7-day money-back guarantee.</p>
          <p className="mt-1">Have questions? <a href="#" className="text-professional-blue">Contact support</a></p>
        </div>
      </main>
    </div>
  )
} 