/**
 * Test for border post zoom button fix
 * Verifies that zoom button appears when loading via URL with Firebase GeoPoint format
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
      }
    }
    return translations[key]?.[language] || key
  })
}))

describe('Border Post Zoom Button Fix', () => {
  const mockOnClose = jest.fn()
  const mockOnBorderPostZoom = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLanguage.mockReturnValue({ language: 'en' })
  })

  afterEach(() => {
    cleanup()
  })

  describe('URL Loading with Firebase GeoPoint Format', () => {
    it('should show zoom button when border post has Firebase GeoPoint location', () => {
      const borderPostDataWithGeoPoint = {
        id: 'test-border-post',
        name: 'Test Border Post',
        location: {
          _latitude: 51.492998,
          _longitude: 53.382564
        },
        is_open: 2,
        countries: 'RUS-KAZ'
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithGeoPoint,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should show zoom button
      expect(container.textContent).toContain('Zoom to Location')
    })

    it('should call zoom function with correct coordinates from Firebase GeoPoint', () => {
      const borderPostDataWithGeoPoint = {
        id: 'test-border-post',
        name: 'Test Border Post',
        location: {
          _latitude: 51.492998,
          _longitude: 53.382564
        },
        is_open: 2
      }

      render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithGeoPoint,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      const zoomButton = screen.getByText('Zoom to Location')
      fireEvent.click(zoomButton)

      // Should call with longitude first, then latitude (GeoJSON format)
      expect(mockOnBorderPostZoom).toHaveBeenCalledWith({
        lng: 53.382564,
        lat: 51.492998
      })
    })

    it('should prefer coordinates array over Firebase GeoPoint when both exist', () => {
      const borderPostDataWithBoth = {
        id: 'test-border-post',
        name: 'Test Border Post',
        coordinates: [10.123, 20.456], // Should use this
        location: {
          _latitude: 51.492998,
          _longitude: 53.382564
        },
        is_open: 2
      }

      render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithBoth,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      const zoomButton = screen.getByText('Zoom to Location')
      fireEvent.click(zoomButton)

      // Should use coordinates array, not Firebase GeoPoint
      expect(mockOnBorderPostZoom).toHaveBeenCalledWith({
        lng: 10.123,
        lat: 20.456
      })
    })

    it('should fallback to feature geometry when no border post coordinates', () => {
      const borderPostDataWithoutCoords = {
        id: 'test-border-post',
        name: 'Test Border Post',
        is_open: 2
      }

      const featureWithGeometry = {
        type: 'Feature',
        properties: {
          id: 'test-border-post',
          name: 'Test Border Post'
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
            data: borderPostDataWithoutCoords,
            feature: featureWithGeometry
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      const zoomButton = screen.getByText('Zoom to Location')
      fireEvent.click(zoomButton)

      // Should use feature geometry coordinates
      expect(mockOnBorderPostZoom).toHaveBeenCalledWith({
        lng: 15.789,
        lat: 25.123
      })
    })

    it('should handle invalid Firebase GeoPoint gracefully', () => {
      const borderPostDataWithInvalidGeoPoint = {
        id: 'test-border-post',
        name: 'Test Border Post',
        location: {
          _latitude: 'invalid',
          _longitude: null
        },
        is_open: 2
      }

      const { container } = render(
        <DetailSidebar
          isOpen={true}
          onClose={mockOnClose}
          selectedFeature={{
            type: 'border-post',
            id: 'test-border-post',
            data: borderPostDataWithInvalidGeoPoint,
            feature: null
          }}
          onBorderPostZoom={mockOnBorderPostZoom}
        />
      )

      // Should not show zoom button with invalid coordinates
      expect(container.textContent).not.toContain('Zoom to Location')
    })
  })
})