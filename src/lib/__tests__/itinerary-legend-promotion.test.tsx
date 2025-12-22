/**
 * Test for itinerary legend mobile app promotion
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SimpleMapContainer from '../../components/SimpleMapContainer'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { ColorSchemeProvider } from '../../contexts/ColorSchemeContext'

// Mock maplibre-gl
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    addControl: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    setLayoutProperty: jest.fn(),
    setPaintProperty: jest.fn(),
    getSource: jest.fn(),
    getLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    queryRenderedFeatures: jest.fn(() => []),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' }
    })),
    project: jest.fn(() => ({ x: 0, y: 0 })),
    unproject: jest.fn(() => ({ lng: 0, lat: 0 })),
    getBounds: jest.fn(() => ({
      getNorthEast: () => ({ lng: 180, lat: 85 }),
      getSouthWest: () => ({ lng: -180, lat: -85 })
    })),
    fitBounds: jest.fn(),
    flyTo: jest.fn(),
    easeTo: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    getZoom: jest.fn(() => 2),
    getCenter: jest.fn(() => ({ lng: 0, lat: 0 })),
    loaded: jest.fn(() => true),
    isStyleLoaded: jest.fn(() => true),
    resize: jest.fn()
  })),
  NavigationControl: jest.fn(),
  AttributionControl: jest.fn(),
  addProtocol: jest.fn()
}))

// Mock pmtiles
jest.mock('pmtiles', () => ({
  Protocol: jest.fn(() => ({
    tile: jest.fn()
  }))
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}))

// Mock i18n
jest.mock('../../lib/i18n', () => ({
  getTranslatedLabel: jest.fn((key) => {
    const translations: Record<string, string> = {
      'itinerary_app_promotion': 'For more information, to download and explore the detailed steps of the itinerary, download the mobile app',
      'app_store': 'App Store',
      'play_store': 'Play Store',
      'itineraries': 'Itineraries',
      'overlanding': 'Overlanding',
      'carnet': 'Carnet'
    }
    return translations[key] || key
  }),
  getLanguagePreference: jest.fn(() => 'en'),
  setLanguagePreference: jest.fn(),
  getBrowserLanguage: jest.fn(() => 'en'),
  isSupportedLanguage: jest.fn(() => true),
  DEFAULT_LANGUAGE: 'en'
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <ColorSchemeProvider>
      {children}
    </ColorSchemeProvider>
  </LanguageProvider>
)

describe('Itinerary Legend Mobile App Promotion', () => {
  beforeEach(() => {
    // Mock window.innerWidth for desktop size to show legend
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should show mobile app promotion when itineraries tab is selected', async () => {
    render(
      <TestWrapper>
        <SimpleMapContainer className="test-map" />
      </TestWrapper>
    )

    // Wait for the component to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find and click the legend toggle button to show the legend
    const legendToggle = screen.getByTitle(/Show Legend|Hide Legend/)
    fireEvent.click(legendToggle)

    // Find and click the itineraries tab
    const itinerariesTab = screen.getByText('Itineraries')
    fireEvent.click(itinerariesTab)

    // Check that the mobile app promotion text is displayed
    const promotionText = screen.getByText(/For more information, to download and explore the detailed steps of the itinerary, download the mobile app/)
    expect(promotionText).toBeInTheDocument()

    // Check that both app store buttons are present
    const appStoreButton = screen.getByText('App Store')
    const playStoreButton = screen.getByText('Play Store')
    
    expect(appStoreButton).toBeInTheDocument()
    expect(playStoreButton).toBeInTheDocument()

    // Check that the buttons have the correct links
    const appStoreLink = appStoreButton.closest('a')
    const playStoreLink = playStoreButton.closest('a')
    
    expect(appStoreLink).toHaveAttribute('href', 'https://apps.apple.com/us/app/overland-map/id6741202903')
    expect(playStoreLink).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=ch.overlandmap.map')

    // Check that the itinerary route legend item is present with correct color
    const itineraryRoute = screen.getByText('Itinerary Route')
    expect(itineraryRoute).toBeInTheDocument()
  })

  it('should not show mobile app promotion when other tabs are selected', async () => {
    render(
      <TestWrapper>
        <SimpleMapContainer className="test-map" />
      </TestWrapper>
    )

    // Wait for the component to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find and click the legend toggle button to show the legend
    const legendToggle = screen.getByTitle(/Show Legend|Hide Legend/)
    fireEvent.click(legendToggle)

    // Check overlanding tab (default)
    const overlandingTab = screen.getByText('Overlanding')
    fireEvent.click(overlandingTab)

    // Should not show mobile app promotion
    const promotionText = screen.queryByText(/For more information, to download and explore the detailed steps of the itinerary, download the mobile app/)
    expect(promotionText).not.toBeInTheDocument()

    // Check carnet tab
    const carnetTab = screen.getByText('Carnet')
    fireEvent.click(carnetTab)

    // Should still not show mobile app promotion
    const promotionTextCarnet = screen.queryByText(/For more information, to download and explore the detailed steps of the itinerary, download the mobile app/)
    expect(promotionTextCarnet).not.toBeInTheDocument()
  })
})