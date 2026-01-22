#!/usr/bin/env ts-node
/**
 * FAQ Translation Script
 * 
 * This script translates the FAQ from English to all supported languages.
 * It uses DeepL API for high-quality translations.
 * 
 * Usage:
 *   1. Get a DeepL API key from https://www.deepl.com/pro-api
 *   2. Set environment variable: export DEEPL_API_KEY="your-key-here"
 *   3. Run: npm run translate-faq
 * 
 * Alternative: Use Google Translate API by modifying the translateText function
 */

import * as fs from 'fs'
import * as path from 'path'

interface FAQItem {
  category: string
  question: string
  answer: string
}

// Language mapping for DeepL API
const LANGUAGE_MAP: Record<string, string> = {
  // 'de': 'DE',     // German
  // 'es': 'ES',     // Spanish
  'fr': 'FR',     // French
  // 'it': 'IT',     // Italian
  // 'ja': 'JA',     // Japanese
  // 'nl': 'NL',     // Dutch
  // 'ru': 'RU'     // Russian
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY environment variable not set')
  }

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text: text,
      target_lang: targetLang,
      source_lang: 'EN',
      preserve_formatting: '1',
      tag_handling: 'xml',
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.translations[0].text
}

/**
 * Alternative: Translate using Google Translate API
 * Uncomment and use this if you prefer Google Translate
 */
/*
async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY environment variable not set')
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}
*/

/**
 * Protect markdown links and newlines from translation
 */
function protectMarkdownLinks(text: string): { protectedText: string; links: string[]; newlines: number[] } {
  const links: string[] = []
  const newlines: number[] = []
  
  // First, protect newlines by replacing them with placeholders
  let protectedText = text.replace(/\n/g, (match, offset) => {
    const index = newlines.length
    newlines.push(offset)
    return `<newline${index}/>`
  })
  
  // Then protect markdown links
  protectedText = protectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    const index = links.length
    links.push(match)
    return `<link${index}/>`
  })
  
  return { protectedText, links, newlines }
}

/**
 * Restore markdown links and newlines after translation
 */
function restoreMarkdownLinks(text: string, links: string[], newlines: number[]): string {
  let restored = text
  
  // Restore links first
  links.forEach((link, index) => {
    restored = restored.replace(`<link${index}/>`, link)
    // Also handle cases where translator might have added spaces
    restored = restored.replace(`<link${index} />`, link)
    restored = restored.replace(`< link${index} />`, link)
    restored = restored.replace(`<link ${index}/>`, link)
  })
  
  // Restore newlines
  newlines.forEach((_, index) => {
    restored = restored.replace(`<newline${index}/>`, '\n')
    // Also handle cases where translator might have added spaces
    restored = restored.replace(`<newline${index} />`, '\n')
    restored = restored.replace(`< newline${index} />`, '\n')
    restored = restored.replace(`<newline ${index}/>`, '\n')
  })
  
  return restored
}

/**
 * Translate a single FAQ item
 */
async function translateFAQItem(
  item: FAQItem,
  targetLang: string
): Promise<FAQItem> {
  console.log(`  Translating: "${item.question.substring(0, 50)}..."`)

  // Protect markdown links and newlines in the answer
  const { protectedText: protectedAnswer, links, newlines } = protectMarkdownLinks(item.answer)

  // Translate each field
  const [category, question, answer] = await Promise.all([
    translateWithDeepL(item.category, targetLang),
    translateWithDeepL(item.question, targetLang),
    translateWithDeepL(protectedAnswer, targetLang),
  ])

  // Restore markdown links and newlines
  const restoredAnswer = restoreMarkdownLinks(answer, links, newlines)

  return {
    category,
    question,
    answer: restoredAnswer,
  }
}

/**
 * Translate entire FAQ file
 */
async function translateFAQ(
  sourcePath: string,
  targetLang: string,
  targetPath: string
): Promise<void> {
  console.log(`\nTranslating FAQ to ${targetLang}...`)

  // Read source file
  const sourceData: FAQItem[] = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'))

  // Translate all items
  const translatedData: FAQItem[] = []
  for (const item of sourceData) {
    try {
      const translated = await translateFAQItem(item, LANGUAGE_MAP[targetLang])
      translatedData.push(translated)
    } catch (error) {
      console.error(`\n✗ Error translating ${item.question} to ${targetLang}:`, error)
      // Continue with other languages
    }
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Write translated file
  fs.writeFileSync(targetPath, JSON.stringify(translatedData, null, 2), 'utf-8')
  console.log(`✓ Saved to ${targetPath}`)
}

/**
 * Main function
 */
async function main() {
  const publicDataDir = path.join(__dirname, '..', 'public', 'data')
  const sourceFile = path.join(publicDataDir, 'faq-en.json')

  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file not found: ${sourceFile}`)
    process.exit(1)
  }

  // Check for API key
  if (!process.env.DEEPL_API_KEY) {
    console.error('Error: DEEPL_API_KEY environment variable not set')
    console.error('\nTo use this script:')
    console.error('1. Get a DeepL API key from https://www.deepl.com/pro-api')
    console.error('2. Set the environment variable:')
    console.error('   export DEEPL_API_KEY="your-key-here"')
    console.error('3. Run this script again')
    process.exit(1)
  }

  console.log('Starting FAQ translation...')
  console.log(`Source: ${sourceFile}`)

  // Translate to all languages
  const languages = Object.keys(LANGUAGE_MAP)
  
  for (const lang of languages) {
    const targetFile = path.join(publicDataDir, `faq-${lang}.json`)
    
    try {
      await translateFAQ(sourceFile, lang, targetFile)
    } catch (error) {
      console.error(`\n✗ Error translating to ${lang}:`, error)
      // Continue with other languages
    }
  }

  console.log('\n✓ Translation complete!')
  console.log('\nNote: Please review the translations for accuracy,')
  console.log('especially technical terms and markdown links.')
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
