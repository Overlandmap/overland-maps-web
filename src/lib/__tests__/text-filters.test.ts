/**
 * Tests for text filtering utilities
 */

import { processItineraryText } from '../text-filters'

describe('processItineraryText', () => {
  test('should transform {->km (\\d+)} to km format', () => {
    const input = 'Distance is {->km 150} from here'
    const expected = 'Distance is 150 km from here'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should transform {->m (\\d+)} to m format', () => {
    const input = 'Altitude is {->m 2500} above sea level'
    const expected = 'Altitude is 2500 m above sea level'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should transform {^ (\\d+)} to m format', () => {
    const input = 'Height is {^ 1800} meters'
    const expected = 'Height is 1800 m meters'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should transform {^(\\d+)} to m format (no space)', () => {
    const input = 'Peak at {^3200} elevation'
    const expected = 'Peak at 3200 m elevation'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should transform itinerary links to HTML links', () => {
    const input = 'Check out [Route G6](:route:G6:) for more details'
    const expected = 'Check out <a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="G6">Route G6</a> for more details'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should handle itinerary links with optional parameters', () => {
    const input = 'See [Alternative Route](:alt:G7:-1) here'
    const expected = 'See <a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="G7">Alternative Route</a> here'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should handle multiple transformations in one text', () => {
    const input = 'Travel {->km 250} to reach {^ 2100} elevation. See [Route G8](:route:G8:) for details.'
    const expected = 'Travel 250 km to reach 2100 m elevation. See <a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="G8">Route G8</a> for details.'
    expect(processItineraryText(input)).toBe(expected)
  })

  test('should handle empty or null input', () => {
    expect(processItineraryText('')).toBe('')
    expect(processItineraryText(null as any)).toBe(null)
    expect(processItineraryText(undefined as any)).toBe(undefined)
  })

  test('should handle text with no transformations needed', () => {
    const input = 'This is regular text with no special formatting'
    expect(processItineraryText(input)).toBe(input)
  })

  test('should handle complex itinerary link patterns', () => {
    const input = 'Connect to [Main Route](:main:G10:5) and then [Side Route](:side:G11:-2)'
    const expected = 'Connect to <a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="G10">Main Route</a> and then <a href="#" class="itinerary-link text-blue-600 hover:text-blue-800 underline" data-itinerary-id="G11">Side Route</a>'
    expect(processItineraryText(input)).toBe(expected)
  })
})