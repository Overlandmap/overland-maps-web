import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailSidebar from '../DetailSidebar';
import { getTranslatedLabel, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../lib/i18n';

// Mock the LanguageContext
const mockUseLanguage = jest.fn();
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockUseLanguage()
}));

// Mock the data loader functions
jest.mock('../../lib/data-loader', () => ({
  getBorderById: jest.fn(),
  loadCountryData: jest.fn(() => Promise.resolve({ countries: [] }))
}));

// Mock the i18n functions we're not testing
jest.mock('../../lib/i18n', () => ({
  ...jest.requireActual('../../lib/i18n'),
  getTranslatedCountryName: jest.fn((country, lang) => country.name || 'Test Country'),
  getTranslatedBorderStatus: jest.fn(() => 'Open'),
  getBorderStatusColorClasses: jest.fn(() => 'bg-green-100 text-green-800'),
  getTranslatedCarnetStatus: jest.fn(() => 'Not required'),
  getTranslatedOverlandingStatus: jest.fn(() => 'Open')
}));

describe('DetailSidebar Itinerary Translation Properties', () => {
  
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
  });

  afterEach(() => {
    cleanup();
  });

  // **Feature: itinerary-detail-translations, Property 1: Mobile app promotion text translation**
  // **Validates: Requirements 1.1**
  describe('Property 1: Mobile app promotion text translation', () => {
    test('should display mobile app promotion text in correct language for any supported language', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LANGUAGES.map(lang => lang.code)),
          (language: SupportedLanguage) => {
            cleanup(); // Clean up before each property test iteration
            mockUseLanguage.mockReturnValue({ language });
            
            const mockFeature = {
              type: 'itinerary' as const,
              id: 'test-itinerary',
              data: null,
              feature: {
                properties: {
                  itineraryId: 'TEST001',
                  name: 'Test Itinerary',
                  lengthKM: 100,
                  nbSteps: 5
                }
              }
            };

            render(
              <DetailSidebar
                isOpen={true}
                onClose={() => {}}
                selectedFeature={mockFeature}
              />
            );

            const expectedText = getTranslatedLabel('itinerary_app_promotion', language);
            const promotionElement = screen.getByText(expectedText);
            
            expect(promotionElement).toBeInTheDocument();
            expect(promotionElement).toHaveTextContent(expectedText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: itinerary-detail-translations, Property 2: Track pack fallback text translation**
  // **Validates: Requirements 1.2**
  describe('Property 2: Track pack fallback text translation', () => {
    test('should display track pack fallback text in correct language when trackPackName is missing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LANGUAGES.map(lang => lang.code)),
          (language: SupportedLanguage) => {
            cleanup(); // Clean up before each property test iteration
            mockUseLanguage.mockReturnValue({ language });
            
            const mockFeature = {
              type: 'itinerary' as const,
              id: 'test-itinerary',
              data: null,
              feature: {
                properties: {
                  itineraryId: 'TEST001',
                  name: 'Test Itinerary',
                  // trackPackName is intentionally missing
                  lengthKM: 100,
                  nbSteps: 5
                }
              }
            };

            render(
              <DetailSidebar
                isOpen={true}
                onClose={() => {}}
                selectedFeature={mockFeature}
              />
            );

            const expectedText = getTranslatedLabel('track_pack', language);
            const trackPackElement = screen.getByRole('heading', { level: 1 });
            
            expect(trackPackElement).toBeInTheDocument();
            expect(trackPackElement).toHaveTextContent(expectedText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: itinerary-detail-translations, Property 3: Length unknown fallback text translation**
  // **Validates: Requirements 1.3**
  describe('Property 3: Length unknown fallback text translation', () => {
    test('should display length unknown text in correct language when lengthKM is missing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LANGUAGES.map(lang => lang.code)),
          (language: SupportedLanguage) => {
            cleanup(); // Clean up before each property test iteration
            mockUseLanguage.mockReturnValue({ language });
            
            const mockFeature = {
              type: 'itinerary' as const,
              id: 'test-itinerary',
              data: null,
              feature: {
                properties: {
                  itineraryId: 'TEST001',
                  name: 'Test Itinerary',
                  trackPackName: 'Test Track Pack',
                  // lengthKM is intentionally missing
                  nbSteps: 5
                }
              }
            };

            render(
              <DetailSidebar
                isOpen={true}
                onClose={() => {}}
                selectedFeature={mockFeature}
              />
            );

            const expectedText = getTranslatedLabel('length_unknown', language);
            const lengthElement = screen.getByText(new RegExp(expectedText));
            
            expect(lengthElement).toBeInTheDocument();
            expect(lengthElement.textContent).toContain(expectedText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: itinerary-detail-translations, Property 4: Days label translation**
  // **Validates: Requirements 1.4**
  describe('Property 4: Days label translation', () => {
    test('should display days label in correct language when lengthDays is present', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LANGUAGES.map(lang => lang.code)),
          fc.integer({ min: 1, max: 100 }),
          (language: SupportedLanguage, stepCount: number) => {
            cleanup(); // Clean up before each property test iteration
            mockUseLanguage.mockReturnValue({ language });
            
            const mockFeature = {
              type: 'itinerary' as const,
              id: `test-itinerary-${stepCount}`, // Make ID unique to avoid conflicts
              data: null,
              feature: {
                properties: {
                  itineraryId: `TEST${stepCount}`,
                  name: `Test Itinerary ${stepCount}`,
                  trackPackName: `Test Track Pack ${stepCount}`,
                  lengthKM: 100,
                  lengthDays: stepCount
                }
              }
            };

            render(
              <DetailSidebar
                isOpen={true}
                onClose={() => {}}
                selectedFeature={mockFeature}
              />
            );

            const expectedDaysText = getTranslatedLabel('days', language);
            const daysElement = screen.getByText(new RegExp(`${stepCount}\\s+${expectedDaysText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
            
            expect(daysElement).toBeInTheDocument();
            expect(daysElement.textContent).toContain(`${stepCount} ${expectedDaysText}`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: itinerary-detail-translations, Property 5: App store button labels translation**
  // **Validates: Requirements 1.5**
  describe('Property 5: App store button labels translation', () => {
    test('should display app store button labels in correct language', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_LANGUAGES.map(lang => lang.code)),
          (language: SupportedLanguage) => {
            cleanup(); // Clean up before each property test iteration
            mockUseLanguage.mockReturnValue({ language });
            
            const mockFeature = {
              type: 'itinerary' as const,
              id: 'test-itinerary',
              data: null,
              feature: {
                properties: {
                  itineraryId: 'TEST001',
                  name: 'Test Itinerary',
                  trackPackName: 'Test Track Pack',
                  lengthKM: 100,
                  nbSteps: 5
                }
              }
            };

            render(
              <DetailSidebar
                isOpen={true}
                onClose={() => {}}
                selectedFeature={mockFeature}
              />
            );

            const expectedAppStoreText = getTranslatedLabel('app_store', language);
            const expectedPlayStoreText = getTranslatedLabel('play_store', language);
            
            const appStoreLinks = screen.getAllByText(expectedAppStoreText);
            const playStoreLinks = screen.getAllByText(expectedPlayStoreText);
            
            expect(appStoreLinks.length).toBeGreaterThan(0);
            expect(appStoreLinks[0]).toBeInTheDocument();
            expect(appStoreLinks[0]).toHaveTextContent(expectedAppStoreText);
            
            expect(playStoreLinks.length).toBeGreaterThan(0);
            expect(playStoreLinks[0]).toBeInTheDocument();
            expect(playStoreLinks[0]).toHaveTextContent(expectedPlayStoreText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for DetailSidebar itinerary rendering
  describe('Unit Tests for DetailSidebar itinerary rendering', () => {
    beforeEach(() => {
      cleanup();
    });

    test('should render itinerary with all properties present', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-full',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST001',
            name: 'Complete Test Itinerary',
            trackPackName: 'Full Track Pack',
            lengthKM: 250,
            lengthDays: 12,
            titlePhotoUrl: 'https://example.com/photo.jpg'
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Check that all elements are rendered
      expect(screen.getByText('Full Track Pack')).toBeInTheDocument();
      expect(screen.getByText('TEST001: Complete Test Itinerary')).toBeInTheDocument();
      expect(screen.getByText('250 km, 12 days')).toBeInTheDocument();
      expect(screen.getByText('For more information, to download and explore the detailed steps of the itinerary, download the mobile app')).toBeInTheDocument();
      expect(screen.getByText('App Store')).toBeInTheDocument();
      expect(screen.getByText('Play Store')).toBeInTheDocument();
    });

    test('should render itinerary with missing trackPackName', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-no-track',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST002',
            name: 'No Track Pack Itinerary',
            lengthKM: 150,
            nbSteps: 8
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should show fallback text
      expect(screen.getByText('Track Pack')).toBeInTheDocument();
      expect(screen.getByText('TEST002: No Track Pack Itinerary')).toBeInTheDocument();
    });

    test('should render itinerary with missing length information', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-no-length',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST003',
            name: 'No Length Itinerary',
            trackPackName: 'Test Track Pack',
            lengthDays: 5
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should show fallback text for length
      expect(screen.getByText(/Length unknown/)).toBeInTheDocument();
      expect(screen.getByText(/5 days/)).toBeInTheDocument();
    });

    test('should render itinerary with missing steps information', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-no-steps',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST004',
            name: 'No Steps Itinerary',
            trackPackName: 'Test Track Pack',
            lengthKM: 100
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should show only length, no steps count
      expect(screen.getByText('100 km')).toBeInTheDocument();
      // Check that there's no step count in the length/steps line
      const lengthElement = screen.getByText('100 km');
      expect(lengthElement.textContent).toBe('100 km');
      expect(lengthElement.textContent).not.toMatch(/\d+\s+steps/);
    });

    test('should render itinerary with minimal properties', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-minimal',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST005',
            name: 'Minimal Itinerary'
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should show fallback values
      expect(screen.getByText('Track Pack')).toBeInTheDocument();
      expect(screen.getByText('TEST005: Minimal Itinerary')).toBeInTheDocument();
      expect(screen.getByText('Length unknown')).toBeInTheDocument();
    });

    test('should integrate properly with useLanguage hook', () => {
      mockUseLanguage.mockReturnValue({ language: 'fr' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-french',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST006',
            name: 'French Itinerary',
            lengthKM: 200,
            lengthDays: 10
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should show French translations
      expect(screen.getByText('Pack de Piste')).toBeInTheDocument(); // French for Track Pack
      expect(screen.getByText('200 km, 10 jours')).toBeInTheDocument(); // French for days in the length line
    });

    test('should handle empty or undefined properties gracefully', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-empty',
        data: null,
        feature: {
          properties: {}
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
        />
      );

      // Should handle gracefully with fallbacks
      expect(screen.getByText('Track Pack')).toBeInTheDocument();
      expect(screen.getByText('Unknown: Unnamed Itinerary')).toBeInTheDocument();
      expect(screen.getByText('Length unknown')).toBeInTheDocument();
    });

    test('should render zoom button for itinerary with geometry', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-with-geometry',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST007',
            name: 'Itinerary with Geometry'
          },
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [1, 1], [2, 2]]
          }
        }
      };

      const mockOnItineraryZoom = jest.fn();

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
          onItineraryZoom={mockOnItineraryZoom}
        />
      );

      // Should show enabled zoom button
      const zoomButton = screen.getByText('Zoom to location');
      expect(zoomButton).toBeInTheDocument();
      expect(zoomButton.closest('button')).not.toBeDisabled();
    });

    test('should render disabled zoom button for itinerary without geometry', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const mockFeature = {
        type: 'itinerary' as const,
        id: 'test-itinerary-no-geometry',
        data: null,
        feature: {
          properties: {
            itineraryId: 'TEST008',
            name: 'Itinerary without Geometry'
          }
          // No geometry property
        }
      };

      const mockOnItineraryZoom = jest.fn();

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={mockFeature}
          onItineraryZoom={mockOnItineraryZoom}
        />
      );

      // Should show disabled zoom button
      const zoomButton = screen.getByText('Zoom to location');
      expect(zoomButton).toBeInTheDocument();
      expect(zoomButton.closest('button')).toBeDisabled();
    });
  });
});