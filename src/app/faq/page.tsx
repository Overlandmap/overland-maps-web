'use client'

import { useState } from 'react'
import { ColorSchemeProvider } from '../../contexts/ColorSchemeContext'
import { LanguageProvider } from '../../contexts/LanguageContext'
import NavigationBar from '../../components/NavigationBar'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    category: 'General',
    question: 'What is Overland Map?',
    answer: 'Overland Map is a comprehensive platform for overlanders, providing detailed information about border crossings, visa requirements, vehicle documentation, climate data, and curated itineraries for overland travel worldwide.'
  },
  {
    category: 'General',
    question: 'Is Overland Map free to use?',
    answer: 'The web version and basic mobile app features are free. Premium features including detailed itineraries and offline maps require a subscription.'
  },
  {
    category: 'Borders & Visas',
    question: 'How accurate is the border crossing information?',
    answer: 'Our data is continuously updated by the overlanding community. We rely on real-world experiences from travelers who have recently crossed borders, making our information more current than official sources.'
  },
  {
    category: 'Borders & Visas',
    question: 'What does the overlanding friendliness rating mean?',
    answer: 'The overlanding friendliness rating indicates how easy it is to visit a country with a vehicle. Green means normal access with standard visa and paperwork, while black indicates it\'s nearly impossible to enter with a motor vehicle.'
  },
  {
    category: 'Borders & Visas',
    question: 'What is a Carnet de Passage?',
    answer: 'A Carnet de Passage en Douane is a document provided by your local automobile club that allows you to temporarily import your vehicle without paying import taxes. It requires a refundable deposit and is required in certain countries.'
  },
  {
    category: 'Mobile App',
    question: 'What platforms is the mobile app available on?',
    answer: 'The Overland Map mobile app is available for both iOS (iPhone/iPad) and Android devices.'
  },
  {
    category: 'Mobile App',
    question: 'Can I use the app offline?',
    answer: 'Yes! Premium subscribers can download maps and itineraries for offline use, perfect for traveling in areas with limited connectivity.'
  },
  {
    category: 'Mobile App',
    question: 'How do I contribute border crossing updates?',
    answer: 'Download the mobile app, create an account, and navigate to any border post. You can then share your experience, update the status, and provide helpful information for other travelers.'
  },
  {
    category: 'Itineraries',
    question: 'What are Track Packs?',
    answer: 'Track Packs are collections of detailed itineraries with GPS waypoints, camping spots, points of interest, and step-by-step navigation for specific routes or regions.'
  },
  {
    category: 'Itineraries',
    question: 'Can I create my own itineraries?',
    answer: 'Yes, premium subscribers can create, save, and share custom itineraries with waypoints and notes.'
  },
  {
    category: 'Technical',
    question: 'Why isn\'t my country showing data?',
    answer: 'We\'re continuously expanding our database. Some countries may have limited data if few overlanders have traveled there recently. You can help by contributing your experiences through the mobile app.'
  },
  {
    category: 'Technical',
    question: 'The map isn\'t loading. What should I do?',
    answer: 'Try refreshing the page or clearing your browser cache. If the problem persists, check our Support page for technical assistance or contact us directly.'
  }
]

function FAQPageContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))]
  const filteredFAQs = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="faq" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find answers to common questions about Overland Map
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-xs font-medium text-blue-600 mb-1 block">
                      {faq.category}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-gray-700 mb-4">
              Can&apos;t find the answer you&apos;re looking for? Visit our Support page or contact us directly.
            </p>
            <a
              href="/support"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Support
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FAQPage() {
  return (
    <LanguageProvider>
      <ColorSchemeProvider>
        <FAQPageContent />
      </ColorSchemeProvider>
    </LanguageProvider>
  )
}
