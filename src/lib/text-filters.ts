/**
 * Text filtering utilities for processing itinerary descriptions and highlights
 */

/**
 * Process text through a series of regex transformations for itinerary content
 * @param text - The raw text to process
 * @returns The processed text with transformations applied
 */
export function processItineraryText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  let processedText = text

  // 1. Transform {->km (\d+)} => $1 km
  processedText = processedText.replace(/\{->km (\d+)\}/g, '$1 km')

  // 2. Transform {->m (\d+)} => $1 m  
  processedText = processedText.replace(/\{->m (\d+)\}/g, '$1 m')

  // 3. Transform {\^ ?(\d+)} => $1 m
  processedText = processedText.replace(/\{\^ ?(\d+)\}/g, '$1 m')

  // 4. Transform \[(.*)\]\(:(\w+)?:(\w+)?:?(-?\d+)?\) => hyperlink
  // This creates a clickable link with text $1 and link to itinerary with id $3
  processedText = processedText.replace(
    /\[(.*?)\]\(:(\w+)?:(\w+)?:?(-?\d+)?\)/g,
    (match, linkText, param1, itineraryId, param3) => {
      // Create a data attribute to store the itinerary ID for click handling
      return `<a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="${itineraryId || ''}">${linkText}</a>`
    }
  )

  return processedText
}

/**
 * Set up click handlers for itinerary links in processed text
 * @param container - The DOM container element containing the processed text
 * @param onItineraryClick - Callback function to handle itinerary clicks
 */
export function setupItineraryLinkHandlers(
  container: HTMLElement,
  onItineraryClick?: (itineraryId: string) => void
): void {
  if (!container || !onItineraryClick) {
    return
  }

  // Find all itinerary links in the container
  const links = container.querySelectorAll('a.itinerary-link[data-itinerary-id]')
  
  links.forEach((link) => {
    const itineraryId = link.getAttribute('data-itinerary-id')
    if (itineraryId) {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        onItineraryClick(itineraryId)
      })
    }
  })
}