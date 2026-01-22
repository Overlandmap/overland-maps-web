'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import NavigationBar from '../../components/NavigationBar'

interface FAQItem {
  question: string
  answer: string
  category: string
}

// Parse markdown-style links [text](href) and newlines, convert to React elements
function parseMarkdownLinks(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match
  let keyCounter = 0

  while ((match = regex.exec(text)) !== null) {
    // Add text before the link (with line breaks)
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index)
      parts.push(...parseTextWithLineBreaks(textBefore, keyCounter))
      keyCounter += textBefore.split('\n').length
    }

    // Add the link
    const linkText = match[1]
    const href = match[2]
    
    // Check if it's an external link (starts with http:// or https://)
    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    
    if (isExternal) {
      // External link - use regular <a> tag with target="_blank"
      parts.push(
        <a
          key={`link-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          {linkText}
        </a>
      )
    } else {
      // Internal link - use Next.js Link component
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={href}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          {linkText}
        </Link>
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text after the last link (with line breaks)
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex)
    parts.push(...parseTextWithLineBreaks(textAfter, keyCounter))
  }

  return parts.length > 0 ? parts : [text]
}

// Helper function to parse text and convert \n to <br /> elements
function parseTextWithLineBreaks(text: string, startKey: number): (string | JSX.Element)[] {
  const lines = text.split('\n')
  const result: (string | JSX.Element)[] = []
  
  lines.forEach((line, index) => {
    if (line) {
      result.push(line)
    }
    // Add <br /> after each line except the last one
    if (index < lines.length - 1) {
      result.push(<br key={`br-${startKey}-${index}`} />)
    }
  })
  
  return result
}

const translations = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions about Overland Map',
    loading: 'Loading FAQs...',
    all: 'All',
    still_have_questions: 'Still have questions?',
    cant_find_answer: "Can't find the answer you're looking for? Visit our Support page or contact us directly.",
    go_to_support: 'Go to Support'
  },
  fr: {
    title: 'Foire Aux Questions',
    subtitle: 'Trouvez des réponses à vos questions',
    loading: 'Chargement des FAQ...',
    all: 'Tout',
    still_have_questions: 'Vous avez encore des questions ?',
    cant_find_answer: "Vous ne trouvez pas la réponse que vous cherchez ? Visitez notre page d'assistance ou contactez-nous directement.",
    go_to_support: 'Aller au Support'
  }
}

function FAQPageContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all') // Use lowercase 'all' as internal key
  const [faqData, setFaqData] = useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en

  useEffect(() => {
    const lang = language || 'en'
    console.log('Loading FAQ for language:', lang)
    setIsLoading(true)
    
    fetch(`/data/faq-${lang}.json`)
      .then(response => {
        console.log(`FAQ fetch response for ${lang}:`, response.status, response.ok)
        if (!response.ok) {
          console.log('Falling back to English FAQ')
          // Fallback to English if translation not available
          return fetch('/data/faq-en.json')
        }
        return response
      })
      .then(response => response.json())
      .then(data => {
        console.log('FAQ data loaded:', data.length, 'items')
        setFaqData(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error loading FAQ data:', error)
        setIsLoading(false)
      })
  }, [language])

  // Get unique categories from FAQ data
  const uniqueCategories = Array.from(new Set(faqData.map(item => item.category)))
  
  // Build categories array with translated "All" first, then actual categories
  const categories = [
    { key: 'all', label: t.all },
    ...uniqueCategories.map(cat => ({ key: cat, label: cat }))
  ]
  
  // Filter FAQs based on selected category
  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="faq" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t.subtitle}
          </p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{t.loading}</p>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
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
                          {parseMarkdownLinks(faq.answer)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Contact Section */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t.still_have_questions}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.cant_find_answer}
            </p>
            <a
              href="/support"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.go_to_support}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FAQPage() {
  return <FAQPageContent />
}
