/**
 * Final verification tests for border post detail consistency
 * Requirements: 1.1, 1.5, 2.5
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
      'open': {
        'en': 'Open',
        'fr': 'Ouvert',
        'de': 'Offen'
      },
      'bilateral': {
        'en': 'Bilateral',
        'fr': 'Bilatéral',
        'de': 'Bilateral'
      },
      'unknown': {
        'en': 'Unknown',
        'fr': 'Inconnu',
        'de': 'Unbekannt'
      }
    }
    return translations[key]?.[language] || key
  })
}))

describe('Border Post Detail Consistency Verification', () => {
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
    it('should render identical content for map click vs URL loading access', () => {
      // Test data representing the same border post from different access methods
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        location: 'Test Location',
        countries: 'Country A, Country B',
        coordinates: [10.123, 20.456],
        is_open: 2,
        comment: 'Original comment',
        comment_translations: {
          en: 'English comment',
          fr: 'Commentaire français',
          de: 'Deutscher Kommentar'
        }
      }

      const featureFromMapClick = {
        type: 'Feature',
        properties: {
          id: 'test-border-post',
          name: 'Test Border Post',
          location: 'Test Location',
          countries: 'Country A, Country B',
          is_open: 2,
          comment: 'Original comment',
          comment_translations: {
            en: 'English comment',
            fr: 'Commentaire français',
            de: 'Deutscher Kommentar'
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [10.123, 20.456]
        }
      }

      // Render with borderPostData (URL loading scenario)
      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container: urlContainer } = render(
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

      // Render with feature data (map click scenario)
      const { container: mapClickContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: null,
            feature: featureFromMapClick
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Both should display the same translated comment
      const urlComment = urlContainer.querySelector('[data-testid="border-post-comment"]') || 
                        urlContainer.textContent
      const mapClickComment = mapClickContainer.querySelector('[data-testid="border-post-comment"]') || 
                             mapClickContainer.textContent

      // Both should contain the English translation
      expect(urlComment).toContain('English comment')
      expect(mapClickComment).toContain('English comment')

      // Both should have zoom buttons
      expect(urlContainer.textContent).toContain('Zoom to Location')
      expect(mapClickContainer.textContent).toContain('Zoom to Location')
    })

    it('should prioritize the most complete data source for translation fields', () => {
      // Scenario: borderPostData has more complete translations
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment',
        comment_translations: {
          en: 'Complete English comment',
          fr: 'Commentaire français complet',
          de: 'Vollständiger deutscher Kommentar',
          es: 'Comentario español completo'
        }
      }

      const featureWithLimitedTranslations = {
        type: 'Feature',
        properties: {
          id: 'test-border-post',
          name: 'Test Border Post',
          comment: 'Feature comment',
          comment_translations: {
            en: 'Limited English comment',
            fr: 'Commentaire français limité'
          }
        }
      }

      mockUseLanguage.mockReturnValue({ language: 'de' })
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostData,
            feature: featureWithLimitedTranslations
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should use the more complete translation from borderPostData
      expect(container.textContent).toContain('Vollständiger deutscher Kommentar')
      expect(container.textContent).not.toContain('Limited English comment')
    })
  })

  describe('Requirement 1.5: Translation button functionality', () => {
    it('should include zoom to location button with proper translations', () => {
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

      // Test French
      cleanup()
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

      // Test German
      cleanup()
      mockUseLanguage.mockReturnValue({ language: 'de' })
      const { container: germanContainer } = render(
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

      expect(germanContainer.textContent).toContain('Zur Position zoomen')
    })

    it('should call onBorderPostZoom when zoom button is clicked', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
        is_open: 1
      }

      mockUseLanguage.mockReturnValue({ language: 'en' })
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
  })

  describe('Requirement 2.5: Error handling and graceful degradation', () => {
    it('should handle malformed comment_translations gracefully', () => {
      const borderPostDataWithMalformedTranslations = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original comment',
        comment_translations: {
          en: 'Valid English',
          fr: null, // Invalid: null value
          de: 123, // Invalid: number instead of string
          es: undefined // Invalid: undefined value
        }
      }

      mockUseLanguage.mockReturnValue({ language: 'fr' })
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithMalformedTranslations,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should fallback to English when French is invalid
      expect(container.textContent).toContain('Valid English')
      expect(container.textContent).not.toContain('null')
      expect(container.textContent).not.toContain('123')
    })

    it('should handle missing coordinates gracefully', () => {
      const borderPostDataWithoutCoordinates = {
        id: 'test-border-post',
        name: 'Test Border Post',
        is_open: 1
        // No coordinates field
      }

      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithoutCoordinates,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should not show zoom button when coordinates are missing
      expect(container.textContent).not.toContain('Zoom to Location')
      // Should still render the border post name
      expect(container.textContent).toContain('Test Border Post')
    })

    it('should handle completely empty data gracefully', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: {},
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

    it('should handle invalid location field types gracefully', () => {
      const borderPostDataWithInvalidLocation = {
        id: 'test-border-post',
        name: 'Test Border Post',
        location: { invalid: 'object' }, // Invalid: object instead of string
        is_open: 1
      }

      mockUseLanguage.mockReturnValue({ language: 'en' })
      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithInvalidLocation,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should not display the invalid location
      expect(container.textContent).not.toContain('[object Object]')
      expect(container.textContent).not.toContain('invalid')
      // Should still render other valid fields
      expect(container.textContent).toContain('Test Border Post')
    })
  })

  describe('Translation fallback chain verification', () => {
    it('should follow proper fallback chain: current language -> English -> original', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Original fallback comment',
        comment_translations: {
          en: 'English fallback comment',
          fr: 'Commentaire français'
          // No German translation
        }
      }

      // Test German (not available) -> should fallback to English
      mockUseLanguage.mockReturnValue({ language: 'de' })
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

      expect(container.textContent).toContain('English fallback comment')

      // Test Spanish (not available, no English) -> should fallback to original
      const dataWithoutEnglish = {
        ...borderPostData,
        comment_translations: {
          fr: 'Commentaire français'
          // No English or Spanish
        }
      }

      cleanup()
      mockUseLanguage.mockReturnValue({ language: 'es' })
      const { container: spanishContainer } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: dataWithoutEnglish,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(spanishContainer.textContent).toContain('Original fallback comment')
    })
  })
})