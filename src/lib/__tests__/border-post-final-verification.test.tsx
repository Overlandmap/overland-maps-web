/**
 * Final verification for border post detail consistency
 * This test verifies the key requirements are met
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
      }
    }
    return translations[key]?.[language] || key
  })
}))

describe('Border Post Final Verification', () => {
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
    it('should render border post details without crashing', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
        is_open: 2,
        comment: 'Test comment',
        comment_translations: {
          en: 'English comment',
          fr: 'Commentaire français'
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
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should render the border post name
      expect(container.textContent).toContain('Test Border Post')
    })
  })

  describe('Requirement 1.5: Translation button functionality', () => {
    it('should include zoom button when coordinates are available', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456],
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
            data: borderPostData,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      expect(container.textContent).toContain('Zoom to Location')
    })

    it('should call zoom function when button is clicked', () => {
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
  })

  describe('Requirement 2.5: Error handling and graceful degradation', () => {
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
      // Should still render the border post name
      expect(container.textContent).toContain('Test Border Post')
    })

    it('should handle empty data gracefully', () => {
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
  })

  describe('Translation functionality verification', () => {
    it('should display comments when available', () => {
      const borderPostData = {
        id: 'test-border-post',
        name: 'Test Border Post',
        comment: 'Test comment text',
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

      expect(container.textContent).toContain('Test comment text')
    })

    it('should handle translation fields when present', () => {
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

      mockUseLanguage.mockReturnValue({ language: 'en' })
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

      // Should contain some comment text (either translated or original)
      const hasComment = container.textContent?.includes('English comment') || 
                        container.textContent?.includes('Original comment')
      expect(hasComment).toBe(true)
    })
  })
})