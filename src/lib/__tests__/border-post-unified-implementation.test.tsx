/**
 * Test to verify the unified border post implementation
 * This test ensures that both access methods (map click and URL) produce identical results
 */

import { render } from '@testing-library/react'
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

describe('Border Post Unified Implementation', () => {
  const mockOnClose = jest.fn()
  const mockOnBorderPostZoom = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLanguage.mockReturnValue({ language: 'en' })
  })

  it('should produce identical results for map click vs URL access with comment translations', () => {
    const testData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      coordinates: [10.123, 20.456],
      is_open: 2,
      comment: 'Original comment',
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
          data: testData,
          feature: null
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    // Capture content before cleanup
    const mapClickContent = mapClickContainer.textContent

    // Cleanup and render URL access version
    mapClickContainer.remove()

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
            properties: testData,
            geometry: {
              type: 'Point',
              coordinates: [10.123, 20.456]
            }
          }
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    // Both should contain identical content
    expect(mapClickContent).toBe(urlAccessContainer.textContent)
    
    // Verify specific content is present in both
    expect(mapClickContent).toContain('Test Border Post')
    expect(mapClickContent).toContain('English comment')
    expect(mapClickContent).toContain('Zoom to location')
    expect(mapClickContent).toContain('Test Location')
    expect(mapClickContent).toContain('USA')
    expect(mapClickContent).toContain('CAN')
  })

  it('should handle comment translations consistently across access methods', () => {
    const testData = {
      id: 'test-border-post',
      name: 'Translation Test',
      comment: 'Original comment',
      comment_translations: {
        en: 'English comment',
        fr: 'Commentaire français',
        de: 'Deutscher Kommentar'
      }
    }

    // Test with French language
    mockUseLanguage.mockReturnValue({ language: 'fr' })

    // Map click access
    const { container: mapClickContainer } = render(
      <DetailSidebar
        isOpen={true}
        onClose={mockOnClose}
        selectedFeature={{
          type: 'border-post',
          id: 'test-border-post',
          data: testData,
          feature: null
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    const mapClickContent = mapClickContainer.textContent
    mapClickContainer.remove()

    // URL access
    const { container: urlAccessContainer } = render(
      <DetailSidebar
        isOpen={true}
        onClose={mockOnClose}
        selectedFeature={{
          type: 'border-post',
          id: 'test-border-post',
          data: null,
          feature: {
            properties: testData
          }
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    // Both should show French translation
    expect(mapClickContent).toContain('Commentaire français')
    expect(urlAccessContainer.textContent).toContain('Commentaire français')
    
    // Both should NOT show the original comment or other translations
    expect(mapClickContent).not.toContain('Original comment')
    expect(mapClickContent).not.toContain('English comment')
    expect(urlAccessContainer.textContent).not.toContain('Original comment')
    expect(urlAccessContainer.textContent).not.toContain('English comment')
    
    // Content should be identical
    expect(mapClickContent).toBe(urlAccessContainer.textContent)
  })

  it('should preserve translation data from feature when database data lacks translations', () => {
    // Simulate real-world scenario: database data without translations, feature with translations
    const databaseData = {
      id: 'test-border-post',
      name: 'Database Border Post',
      comment: 'Database comment',
      is_open: 2,
      coordinates: [10.123, 20.456]
      // No comment_translations in database data
    }

    const featureData = {
      id: 'test-border-post',
      name: 'Feature Border Post',
      comment: 'Feature comment',
      comment_translations: {
        en: 'English from feature',
        fr: 'Français depuis feature',
        de: 'Deutsch von Feature'
      }
    }

    // Test with French language
    mockUseLanguage.mockReturnValue({ language: 'fr' })

    // Simulate map click: database data + feature with translations
    const { container } = render(
      <DetailSidebar
        isOpen={true}
        onClose={mockOnClose}
        selectedFeature={{
          type: 'border-post',
          id: 'test-border-post',
          data: databaseData,
          feature: {
            properties: featureData,
            geometry: {
              type: 'Point',
              coordinates: [10.123, 20.456]
            }
          }
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    // Should show French translation from feature, not database comment
    expect(container.textContent).toContain('Français depuis feature')
    expect(container.textContent).not.toContain('Database comment')
    expect(container.textContent).not.toContain('Feature comment')
    
    // Should use database data for other fields (name, coordinates, etc.)
    expect(container.textContent).toContain('Database Border Post')
  })
})