/**
 * Comprehensive verification test for border post detail consistency
 * Task 7: Final verification and cleanup
 * 
 * This test verifies:
 * - Consistent behavior across all access methods (Requirement 1.1)
 * - Proper error handling and graceful degradation (Requirement 2.5)
 * - Translation button functionality (Requirement 1.5)
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import DetailSidebar from '../../components/DetailSidebar'

// Mock the LanguageContext
const mockUseLanguage = jest.fn()
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockUseLanguage()
}))

// Mock the data loader functions
jest.mock('../../lib/data-loader', () => ({
  loadCountryData: jest.fn(() => Promise.resolve({ countries: [] })),
  getBorderById: jest.fn(() => Promise.resolve(null))
}))

jest.mock('../../lib/border-post-data', () => ({
  getBorderPostById: jest.fn(() => Promise.resolve(null))
}))

jest.mock('../../lib/i18n', () => ({
  getTranslatedLabel: jest.fn((key: string, language: string) => {
    const translations: Record<string, Record<string, string>> = {
      'zoom_to_location': {
        'en': 'Zoom to Location',
        'fr': 'Zoomer sur l\'emplacement',
        'de': 'Zur Position zoomen'
      },
      'comment': {
        'en': 'Comment',
        'fr': 'Commentaire',
        'de': 'Kommentar'
      },
      'countries': {
        'en': 'Countries',
        'fr': 'Pays',
        'de': 'Länder'
      },
      'closed': {
        'en': 'Closed',
        'fr': 'Fermé',
        'de': 'Geschlossen'
      },
      'bilateral': {
        'en': 'Bilateral',
        'fr': 'Bilatéral',
        'de': 'Bilateral'
      },
      'open': {
        'en': 'Open',
        'fr': 'Ouvert',
        'de': 'Offen'
      }
    }
    return translations[key]?.[language] || key
  })
}))

describe('Border Post Comprehensive Verification', () => {
  const mockOnClose = jest.fn()
  const mockOnBorderPostZoom = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLanguage.mockReturnValue({ language: 'en' })
  })

  afterEach(() => {
    cleanup()
  })

  describe('Requirement 1.1: Consistent behavior across access methods', () => {
    it('should render identical content for map click vs URL access', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
        is_open: 2,
        comment: 'Test comment',
        comment_translations: {
          en: 'English comment',
          fr: 'French comment'
        },
        countries: 'USA,CAN',
        location: 'Test Location'
      }

      // Simulate map click access (data from borderPostData)
      const { container: mapClickContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Capture content before cleanup
      const mapClickContent = mapClickContainer.textContent

      cleanup()

      // Simulate URL access (data from feature properties)
      const { container: urlAccessContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: null,
            feature: {
              properties: borderPostData,
              geometry: {
                type: 'Point',
                coordinates: [10.123, 20.456]
              }
            }
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Both should contain the same essential content
      expect(mapClickContent).toContain('Test Border Post')
      expect(urlAccessContainer.textContent).toContain('Test Border Post')
      
      expect(mapClickContent).toContain('English comment')
      expect(urlAccessContainer.textContent).toContain('English comment')
      
      expect(mapClickContent).toContain('Zoom to Location')
      expect(urlAccessContainer.textContent).toContain('Zoom to Location')
    })

    it('should prioritize the most complete data source', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'BorderPost Name',
        comment_translations: {
          en: 'BorderPost English',
          fr: 'BorderPost French',
          de: 'BorderPost German'
        }
      }

      const featureData = {
        properties: {
          id: 'test-border-post',
          name: 'Feature Name',
          comment_translations: {
            en: 'Feature English'
          }
        }
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: featureData
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should use borderPostData because it has more complete translations
      expect(container.textContent).toContain('BorderPost English')
      expect(container.textContent).not.toContain('Feature English')
    })
  })

  describe('Requirement 1.5: Translation button functionality', () => {
    it('should display zoom button with proper translations', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
        is_open: 1
      }

      // Test English
      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container: englishContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(englishContainer.textContent).toContain('Zoom to Location')

      cleanup()

      // Test French
      mockUseLanguage.mockReturnValue({ language: 'fr' })
      const { container: frenchContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(frenchContainer.textContent).toContain('Zoomer sur l\'emplacement')
    })

    it('should call zoom function with correct coordinates', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
        is_open: 1
      }

      render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      const zoomButton = screen.getByText('Zoom to Location')
      fireEvent.click(zoomButton)

      expect(mockOnBorderPostZoom).toHaveBeenCalledWith({
        lng: 10.123,
        lat: 20.456
      })
    })

    it('should work with coordinates from feature geometry', () => {
      const featureData = {
        properties: {
          id: 'test-border-post',
          name: 'Test Border Post',
          is_open: 1
        },
        geometry: {
          type: 'Point',
          coordinates: [15.789, 25.123]
        }
      }

      render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: null,
            feature: featureData
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      const zoomButton = screen.getByText('Zoom to Location')
      fireEvent.click(zoomButton)

      expect(mockOnBorderPostZoom).toHaveBeenCalledWith({
        lng: 15.789,
        lat: 25.123
      })
    })
  })

  describe('Requirement 2.5: Error handling and graceful degradation', () => {
    it('should handle null/undefined data gracefully', () => {
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: null,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should render default border post title
      expect(container.textContent).toContain('Border Post')
      // Should not crash or show undefined/null values
      expect(container.textContent).not.toContain('undefined')
      expect(container.textContent).not.toContain('null')
    })

    it('should handle malformed translation data', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment',
        comment_translations: 'invalid-translation-data', // Should be object
        is_open: 1
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should fallback to original comment
      expect(container.textContent).toContain('Original comment')
      // Should not crash
      expect(container.textContent).toContain('Test Border Post')
    })

    it('should handle missing coordinates gracefully', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        is_open: 1
        // No coordinates
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should not show zoom button when coordinates are missing
      expect(container.textContent).not.toContain('Zoom to Location')
      // Should still render the border post
      expect(container.textContent).toContain('Test Border Post')
    })

    it('should handle invalid coordinates gracefully', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: ['invalid', 'coordinates'], // Should be numbers
        is_open: 1
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should still render the border post
      expect(container.textContent).toContain('Test Border Post')
      // Should not crash
      expect(container.textContent).not.toContain('undefined')
    })

    it('should handle different border post status values', () => {
      const statusTests = [
        { is_open: 0, expectedStatus: 'Closed' },
        { is_open: 1, expectedStatus: 'Bilateral' },
        { is_open: 2, expectedStatus: 'Open' },
        { is_open: -1, expectedStatus: 'unknown' }, // Invalid status
        { is_open: undefined, expectedStatus: 'unknown' } // Missing status
      ]

      statusTests.forEach(({ is_open, expectedStatus }) => {
        const borderPostData = {
          id: 'test-border-post',
          name: 'Test Border Post',
          is_open
        }

        const { container } = render(
          <DetailSidebar
            isOpen={true}
            onClose={mockOnClose}
            selectedFeature={{
              type: 'border-post',
              id: 'test-border-post',
              data: borderPostData,
              feature: null
            }}
            onBorderPostZoom={mockOnBorderPostZoom}
          />
        )

        // Should handle all status values gracefully
        expect(container.textContent).toContain('Test Border Post')
        
        cleanup()
      })
    })
  })

  describe('Translation fallback behavior', () => {
    it('should follow proper translation fallback chain', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment',
        comment_translations: {
          en: 'English comment',
          fr: 'French comment'
        },
        is_open: 1
      }

      // Test with unsupported language (should fallback to English)
      mockUseLanguage.mockReturnValue({ language: 'es' })
      const { container: spanishContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should fallback to English when Spanish is not available
      expect(spanishContainer.textContent).toContain('English comment')

      cleanup()

      // Test with no translations (should fallback to original)
      const borderPostDataNoTranslations = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment only',
        is_open: 1
      }

      const { container: noTranslationsContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataNoTranslations,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should use original comment when no translations available
      expect(noTranslationsContainer.textContent).toContain('Original comment only')
    })
  })

  describe('Language reactivity', () => {
    it('should update display when language changes', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment',
        comment_translations: {
          en: 'English comment',
          fr: 'French comment'
        },
        is_open: 1,
        coordinates: [10.123, 20.456]
      }

      // Test English
      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container: englishContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(englishContainer.textContent).toContain('English comment')
      expect(englishContainer.textContent).toContain('Zoom to Location')

      cleanup()

      // Test French
      mockUseLanguage.mockReturnValue({ language: 'fr' })
      const { container: frenchContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(frenchContainer.textContent).toContain('French comment')
      expect(frenchContainer.textContent).toContain('Zoomer sur l\'emplacement')
    })
  })
})