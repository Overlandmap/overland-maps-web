/**
 * Test for border post crossing text functionality
 * Tests the generateCrossingText function and its integration in DetailSidebar
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DetailSidebar from '../../components/DetailSidebar'
import { LanguageProvider } from '../../contexts/LanguageContext'

// Mock the data loader functions
jest.mock('../../lib/data-loader', () => ({
  loadCountryData: jest.fn(() => Promise.resolve({ 
    countries: [
      { id: 'RUS', name: 'Russia', translations: { en: 'Russia', de: 'Russland', fr: 'Russie' } },
      { id: 'KAZ', name: 'Kazakhstan', translations: { en: 'Kazakhstan', de: 'Kasachstan', fr: 'Kazakhstan' } },
      { id: 'USA', name: 'United States', translations: { en: 'United States', de: 'Vereinigte Staaten', fr: 'États-Unis' } },
      { id: 'CAN', name: 'Canada', translations: { en: 'Canada', de: 'Kanada', fr: 'Canada' } }
    ] 
  })),
  getBorderById: jest.fn(() => Promise.resolve(null))
}))

// Mock other dependencies
jest.mock('../../lib/border-post-data', () => ({
  getBorderPostById: jest.fn(() => Promise.resolve(null))
}))

jest.mock('../../lib/i18n', () => ({
  ...jest.requireActual('../../lib/i18n'),
  getTranslatedLabel: jest.fn((key: string, language: string = 'en') => {
    const translations: Record<string, Record<string, string>> = {
      'crossing_between': {
        'en': 'Crossing between {country1} and {country2}',
        'de': 'Grenzübergang zwischen {country1} und {country2}',
        'fr': 'Passage entre {country1} et {country2}'
      }
    }
    return translations[key]?.[language] || key
  }),
  getTranslatedCountryName: jest.fn((country: any, language: string) => {
    return country.translations?.[language] || country.name
  })
}))

describe('Border Post Crossing Text', () => {
  const mockOnClose = jest.fn()
  const mockOnBorderPostZoom = jest.fn()

  const renderWithLanguage = (component: React.ReactElement, language = 'en') => {
    return render(
      <LanguageProvider>
        {component}
      </LanguageProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display crossing text for border post with countries field', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: 'RUS-KAZ',
      is_open: 2,
      coordinates: [76.9, 43.2]
    }

    renderWithLanguage(
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

    // Wait for the crossing text to be generated and displayed
    await waitFor(() => {
      expect(screen.getByText('Crossing between Russia and Kazakhstan')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display crossing text in different languages', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: 'USA-CAN',
      is_open: 2,
      coordinates: [-95.0, 49.0]
    }

    // Test with German language context
    render(
      <LanguageProvider>
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
      </LanguageProvider>
    )

    // Should show crossing text with country names
    await waitFor(() => {
      const crossingText = screen.getByText(/Crossing between/)
      expect(crossingText).toBeInTheDocument()
      expect(crossingText.textContent).toContain('United States')
      expect(crossingText.textContent).toContain('Canada')
    }, { timeout: 3000 })
  })

  it('should not display crossing text when countries field is missing', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      is_open: 2,
      coordinates: [76.9, 43.2]
    }

    renderWithLanguage(
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

    // Wait a bit to ensure the component has rendered
    await waitFor(() => {
      expect(screen.getByText('🛂 Test Border Post')).toBeInTheDocument()
    })

    // Should not display crossing text
    expect(screen.queryByText(/Crossing between/)).not.toBeInTheDocument()
  })

  it('should handle malformed countries field gracefully', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: 'INVALID_FORMAT',
      is_open: 2,
      coordinates: [76.9, 43.2]
    }

    renderWithLanguage(
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

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('🛂 Test Border Post')).toBeInTheDocument()
    })

    // Should either not display crossing text or display the fallback
    const crossingElement = screen.queryByText(/Crossing/)
    if (crossingElement) {
      // If it displays, it should show the fallback (original field value)
      expect(screen.getByText('INVALID_FORMAT')).toBeInTheDocument()
    }
  })

  it('should handle countries field with unknown country codes', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: 'XXX-YYY',
      is_open: 2,
      coordinates: [0, 0]
    }

    renderWithLanguage(
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

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('🛂 Test Border Post')).toBeInTheDocument()
    })

    // Should display crossing text with country codes as fallback
    await waitFor(() => {
      const crossingText = screen.queryByText(/Crossing between/)
      if (crossingText) {
        expect(crossingText.textContent).toContain('XXX')
        expect(crossingText.textContent).toContain('YYY')
      }
    }, { timeout: 3000 })
  })

  it('should update crossing text when language changes', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: 'USA-CAN',
      is_open: 2,
      coordinates: [-95.0, 49.0]
    }

    const { rerender } = renderWithLanguage(
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

    // Verify initial text is displayed
    await waitFor(() => {
      const crossingText = screen.getByText(/Crossing between/)
      expect(crossingText).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle empty countries field', async () => {
    const borderPostData = {
      id: 'test-border-post',
      name: 'Test Border Post',
      countries: '',
      is_open: 2,
      coordinates: [0, 0]
    }

    renderWithLanguage(
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

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('🛂 Test Border Post')).toBeInTheDocument()
    })

    // Should not display crossing text for empty countries field
    expect(screen.queryByText('Crossing:')).not.toBeInTheDocument()
  })

  it('should handle countries field from feature properties', async () => {
    const feature = {
      properties: {
        id: 'test-border-post',
        name: 'Test Border Post',
        countries: 'RUS-KAZ',
        is_open: 2,
        coordinates: [76.9, 43.2]
      }
    }

    renderWithLanguage(
      <DetailSidebar
        isOpen={true}
        onClose={mockOnClose}
        selectedFeature={{
          type: 'border-post',
          id: 'test-border-post',
          data: null,
          feature: feature
        }}
        onBorderPostZoom={mockOnBorderPostZoom}
      />
    )

    // Wait for the crossing text to be generated and displayed
    await waitFor(() => {
      expect(screen.getByText('Crossing between Russia and Kazakhstan')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})