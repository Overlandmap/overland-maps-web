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

describe('DetailSidebar Integration Tests - Description and Highlights', () => {
  
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Real Itinerary Data Integration Tests', () => {
    
    test('should render itinerary with real-world data structure from Mongolia', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      // Real data structure from the itineraries.json file
      const realItineraryFeature = {
        type: 'itinerary' as const,
        id: '0ANgc4146W8cMQqwfaB0',
        data: null,
        feature: {
          properties: {
            id: "0ANgc4146W8cMQqwfaB0",
            itineraryId: "G6",
            name: "Khermen Tsav – Shinejinst",
            trackPackName: "Mongolia Track Pack",
            lengthKM: 290,
            lengthDays: 2,
            description: "This area is one of the remotest and most arid regions of Mongolia. You won't likely meet any nomads, because the desert doesn't offer enough to eat for their animals to survive. This itinerary crosses the \"black desert\" and reaches one of the most spectacular sites of the Gobi: Khermen Tsav.\nIf you've fueled up in Gurvantes, you'll need at least 400 km of range, as there is no fuel on this route until Shinejinst.",
            highlights: "Getting lost in the maze of canyons in Khermen Tsav.\nPausing to photograph the colorful canyons of Nogoon Tsav (tsav meaning crack or fissure in Mongolian).",
            translatedDesc: {
              "fr": "Vous traversez ici une des régions les plus arides et reculées de Mongolie, que les nomades ne fréquentent pas – en dehors des oasis – car ils ne peuvent pas y faire paître leurs troupeaux. Cet itinéraire vous emmène, à travers le « désert noir » sur deux sites exceptionnels, parmi les plus beaux et les plus sauvages du Gobi : les canyons aux splendides roches colorées de Khermen Tsav et de Nogoon Tsav."
            },
            translatedHighlights: {
              "fr": "Khermen Tsav, la fantastique \"citadelle de roches\" dans le désert.\nNogoon Tsav, très photogéniques avec ses roches blanches, rouges ouvertes (tsav veut dire cassure ou fissure en mongol)."
            },
            titlePhotoUrl: "https://imagedelivery.net/kLFoGYyvldGdieKRrzQmRQ/5fbeb221-8396-4386-5f5a-feddcde64700/public"
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={realItineraryFeature}
        />
      );

      // Verify basic itinerary information is displayed
      expect(screen.getByText('Mongolia Track Pack')).toBeInTheDocument();
      expect(screen.getByText('G6: Khermen Tsav – Shinejinst')).toBeInTheDocument();
      expect(screen.getByText('290 km, 2 days')).toBeInTheDocument();

      // Verify description section is displayed with English content
      expect(screen.getByText('Description:')).toBeInTheDocument();
      expect(screen.getByText(/This area is one of the remotest and most arid regions of Mongolia/)).toBeInTheDocument();
      expect(screen.getByText(/black desert.*Khermen Tsav/)).toBeInTheDocument();

      // Verify highlights section is displayed with English content
      expect(screen.getByText('Highlights:')).toBeInTheDocument();
      expect(screen.getByText(/Getting lost in the maze of canyons in Khermen Tsav/)).toBeInTheDocument();
      expect(screen.getByText(/colorful canyons of Nogoon Tsav/)).toBeInTheDocument();

      // Verify line breaks are preserved
      const descriptionElement = screen.getByText(/This area is one of the remotest and most arid regions of Mongolia/);
      expect(descriptionElement).toHaveClass('whitespace-pre-line');
      
      const highlightsElement = screen.getByText(/Getting lost in the maze of canyons in Khermen Tsav/);
      expect(highlightsElement).toHaveClass('whitespace-pre-line');
    });

    test('should render itinerary with French translations when language is French', () => {
      mockUseLanguage.mockReturnValue({ language: 'fr' });
      
      const realItineraryFeature = {
        type: 'itinerary' as const,
        id: '0ANgc4146W8cMQqwfaB0',
        data: null,
        feature: {
          properties: {
            id: "0ANgc4146W8cMQqwfaB0",
            itineraryId: "G6",
            name: "Khermen Tsav – Shinejinst",
            trackPackName: "Mongolia Track Pack",
            lengthKM: 290,
            lengthDays: 2,
            description: "This area is one of the remotest and most arid regions of Mongolia...",
            highlights: "Getting lost in the maze of canyons in Khermen Tsav...",
            translatedDesc: {
              "fr": "Vous traversez ici une des régions les plus arides et reculées de Mongolie, que les nomades ne fréquentent pas – en dehors des oasis – car ils ne peuvent pas y faire paître leurs troupeaux. Cet itinéraire vous emmène, à travers le « désert noir » sur deux sites exceptionnels, parmi les plus beaux et les plus sauvages du Gobi : les canyons aux splendides roches colorées de Khermen Tsav et de Nogoon Tsav."
            },
            translatedHighlights: {
              "fr": "Khermen Tsav, la fantastique \"citadelle de roches\" dans le désert.\nNogoon Tsav, très photogéniques avec ses roches blanches, rouges ouvertes (tsav veut dire cassure ou fissure en mongol)."
            }
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={realItineraryFeature}
        />
      );

      // Verify French translations are displayed
      expect(screen.getByText('Description:')).toBeInTheDocument(); // French label (same as English)
      expect(screen.getByText(/Vous traversez ici une des régions les plus arides et reculées de Mongolie/)).toBeInTheDocument();
      expect(screen.getByText(/désert noir.*Khermen Tsav et de Nogoon Tsav/)).toBeInTheDocument();

      expect(screen.getByText('Points forts:')).toBeInTheDocument(); // French label
      expect(screen.getByText(/Khermen Tsav, la fantastique "citadelle de roches" dans le désert/)).toBeInTheDocument();
      expect(screen.getByText(/Nogoon Tsav.*tsav veut dire cassure ou fissure en mongol/)).toBeInTheDocument();
    });

    test('should fallback to English when translation not available for current language', () => {
      mockUseLanguage.mockReturnValue({ language: 'de' }); // German not available in test data
      
      const realItineraryFeature = {
        type: 'itinerary' as const,
        id: '0ANgc4146W8cMQqwfaB0',
        data: null,
        feature: {
          properties: {
            id: "0ANgc4146W8cMQqwfaB0",
            itineraryId: "G6",
            name: "Khermen Tsav – Shinejinst",
            description: "This area is one of the remotest and most arid regions of Mongolia. You won't likely meet any nomads, because the desert doesn't offer enough to eat for their animals to survive.",
            highlights: "Getting lost in the maze of canyons in Khermen Tsav.\nPausing to photograph the colorful canyons of Nogoon Tsav.",
            translatedDesc: {
              "fr": "Vous traversez ici une des régions les plus arides et reculées de Mongolie..."
            },
            translatedHighlights: {
              "fr": "Khermen Tsav, la fantastique \"citadelle de roches\" dans le désert..."
            }
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={realItineraryFeature}
        />
      );

      // Should fallback to English content since German is not available
      expect(screen.getByText(/This area is one of the remotest and most arid regions of Mongolia/)).toBeInTheDocument();
      expect(screen.getByText(/Getting lost in the maze of canyons in Khermen Tsav/)).toBeInTheDocument();
    });

    test('should fallback to English translation when current language translation missing', () => {
      mockUseLanguage.mockReturnValue({ language: 'es' }); // Spanish not available
      
      const realItineraryFeature = {
        type: 'itinerary' as const,
        id: '0ANgc4146W8cMQqwfaB0',
        data: null,
        feature: {
          properties: {
            id: "0ANgc4146W8cMQqwfaB0",
            itineraryId: "G6",
            name: "Khermen Tsav – Shinejinst",
            description: "Original English description",
            highlights: "Original English highlights",
            translatedDesc: {
              "en": "English translated description",
              "fr": "French translated description"
            },
            translatedHighlights: {
              "en": "English translated highlights",
              "fr": "French translated highlights"
            }
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={realItineraryFeature}
        />
      );

      // Should use English translation as fallback
      expect(screen.getByText('English translated description')).toBeInTheDocument();
      expect(screen.getByText('English translated highlights')).toBeInTheDocument();
    });

    test('should not display sections when no content is available', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const itineraryWithoutContent = {
        type: 'itinerary' as const,
        id: 'no-content',
        data: null,
        feature: {
          properties: {
            id: "no-content",
            itineraryId: "NC1",
            name: "No Content Itinerary",
            lengthKM: 100
            // No description, highlights, or translations
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={itineraryWithoutContent}
        />
      );

      // Should not display description or highlights sections
      expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      expect(screen.queryByText('Highlights:')).not.toBeInTheDocument();
      
      // But should still display basic itinerary info
      expect(screen.getByText('NC1: No Content Itinerary')).toBeInTheDocument();
      expect(screen.getByText('100 km')).toBeInTheDocument();
    });

    test('should handle mixed content availability (description but no highlights)', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const partialContentItinerary = {
        type: 'itinerary' as const,
        id: 'partial-content',
        data: null,
        feature: {
          properties: {
            id: "partial-content",
            itineraryId: "PC1",
            name: "Partial Content Itinerary",
            description: "This itinerary has a description but no highlights.",
            lengthKM: 150
            // No highlights
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={partialContentItinerary}
        />
      );

      // Should display description section
      expect(screen.getByText('Description:')).toBeInTheDocument();
      expect(screen.getByText('This itinerary has a description but no highlights.')).toBeInTheDocument();
      
      // Should not display highlights section
      expect(screen.queryByText('Highlights:')).not.toBeInTheDocument();
    });

    test('should handle mixed content availability (highlights but no description)', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const partialContentItinerary = {
        type: 'itinerary' as const,
        id: 'partial-content-2',
        data: null,
        feature: {
          properties: {
            id: "partial-content-2",
            itineraryId: "PC2",
            name: "Partial Content Itinerary 2",
            highlights: "This itinerary has highlights but no description.",
            lengthKM: 200
            // No description
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={partialContentItinerary}
        />
      );

      // Should not display description section
      expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      
      // Should display highlights section
      expect(screen.getByText('Highlights:')).toBeInTheDocument();
      expect(screen.getByText('This itinerary has highlights but no description.')).toBeInTheDocument();
    });
  });

  describe('Multi-language Context Testing', () => {
    
    test('should properly switch content when language context changes', () => {
      const itineraryFeature = {
        type: 'itinerary' as const,
        id: 'multilang-test',
        data: null,
        feature: {
          properties: {
            id: "multilang-test",
            itineraryId: "ML1",
            name: "Multilingual Test Itinerary",
            description: "English description content",
            highlights: "English highlights content",
            translatedDesc: {
              "fr": "Contenu de description française",
              "de": "Deutsche Beschreibung Inhalt"
            },
            translatedHighlights: {
              "fr": "Contenu des points forts français",
              "de": "Deutsche Highlights Inhalt"
            }
          }
        }
      };

      // Test English (original)
      mockUseLanguage.mockReturnValue({ language: 'en' });
      const { rerender } = render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={itineraryFeature}
        />
      );

      expect(screen.getByText('English description content')).toBeInTheDocument();
      expect(screen.getByText('English highlights content')).toBeInTheDocument();

      // Test French - render new component instead of rerender
      cleanup();
      mockUseLanguage.mockReturnValue({ language: 'fr' });
      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={itineraryFeature}
        />
      );

      expect(screen.getByText('Contenu de description française')).toBeInTheDocument();
      expect(screen.getByText('Contenu des points forts français')).toBeInTheDocument();

      // Test German - render new component instead of rerender
      cleanup();
      mockUseLanguage.mockReturnValue({ language: 'de' });
      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={itineraryFeature}
        />
      );

      expect(screen.getByText('Deutsche Beschreibung Inhalt')).toBeInTheDocument();
      expect(screen.getByText('Deutsche Highlights Inhalt')).toBeInTheDocument();
    });
  });

  describe('Text Formatting and Styling Tests', () => {
    
    test('should preserve line breaks in description and highlights content', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const formattedContentItinerary = {
        type: 'itinerary' as const,
        id: 'formatted-content',
        data: null,
        feature: {
          properties: {
            id: "formatted-content",
            itineraryId: "FC1",
            name: "Formatted Content Itinerary",
            description: "First line of description.\nSecond line of description.\nThird line of description.",
            highlights: "First highlight point.\nSecond highlight point.\nThird highlight point."
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={formattedContentItinerary}
        />
      );

      // Check that content elements have whitespace-pre-line class for line break preservation
      const descriptionElement = screen.getByText(/First line of description.*Second line of description.*Third line of description/);
      expect(descriptionElement).toHaveClass('whitespace-pre-line');
      
      const highlightsElement = screen.getByText(/First highlight point.*Second highlight point.*Third highlight point/);
      expect(highlightsElement).toHaveClass('whitespace-pre-line');
    });

    test('should apply consistent styling with proper visual hierarchy', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const styledItinerary = {
        type: 'itinerary' as const,
        id: 'styled-content',
        data: null,
        feature: {
          properties: {
            id: "styled-content",
            itineraryId: "SC1",
            name: "Styled Content Itinerary",
            description: "Test description for styling verification",
            highlights: "Test highlights for styling verification"
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={styledItinerary}
        />
      );

      // Check description section styling
      const descriptionLabel = screen.getByText('Description:');
      expect(descriptionLabel).toHaveClass('text-gray-600', 'text-sm', 'font-medium');
      
      const descriptionContent = screen.getByText('Test description for styling verification');
      expect(descriptionContent).toHaveClass('text-sm', 'text-gray-800', 'whitespace-pre-line', 'leading-relaxed');
      expect(descriptionContent.closest('div')).toHaveClass('bg-gray-50', 'p-3', 'rounded-lg', 'border', 'border-gray-200');

      // Check highlights section styling
      const highlightsLabel = screen.getByText('Highlights:');
      expect(highlightsLabel).toHaveClass('text-gray-600', 'text-sm', 'font-medium');
      
      const highlightsContent = screen.getByText('Test highlights for styling verification');
      expect(highlightsContent).toHaveClass('text-sm', 'text-gray-800', 'whitespace-pre-line', 'leading-relaxed');
      expect(highlightsContent.closest('div')).toHaveClass('bg-blue-50', 'p-3', 'rounded-lg', 'border', 'border-blue-200');
    });
  });

  describe('Layout Position and Integration Tests', () => {
    
    test('should position description and highlights sections in correct order within layout', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const completeItinerary = {
        type: 'itinerary' as const,
        id: 'complete-layout',
        data: null,
        feature: {
          properties: {
            id: "complete-layout",
            itineraryId: "CL1",
            name: "Complete Layout Test",
            trackPackName: "Test Track Pack",
            lengthKM: 300,
            lengthDays: 3,
            description: "Test description content",
            highlights: "Test highlights content",
            titlePhotoUrl: "https://example.com/photo.jpg"
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={completeItinerary}
        />
      );

      // Get all text content to verify order
      const allText = document.body;
      const textContent = allText.textContent || '';

      // Verify the order of elements
      const trackPackIndex = textContent.indexOf('Test Track Pack');
      const itineraryNameIndex = textContent.indexOf('CL1: Complete Layout Test');
      const lengthIndex = textContent.indexOf('300 km, 3 days');
      const descriptionIndex = textContent.indexOf('Description:');
      const highlightsIndex = textContent.indexOf('Highlights:');
      const appPromotionIndex = textContent.indexOf('For more information');

      // Verify correct order
      expect(trackPackIndex).toBeLessThan(itineraryNameIndex);
      expect(itineraryNameIndex).toBeLessThan(lengthIndex);
      expect(lengthIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(highlightsIndex);
      expect(highlightsIndex).toBeLessThan(appPromotionIndex);
    });

    test('should maintain layout integrity when sections are missing', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const minimalItinerary = {
        type: 'itinerary' as const,
        id: 'minimal-layout',
        data: null,
        feature: {
          properties: {
            id: "minimal-layout",
            itineraryId: "MIN1",
            name: "Minimal Layout Test"
            // No description, highlights, or other optional content
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={minimalItinerary}
        />
      );

      // Should still display basic structure
      expect(screen.getByText('Track Pack')).toBeInTheDocument(); // Fallback
      expect(screen.getByText('MIN1: Minimal Layout Test')).toBeInTheDocument();
      expect(screen.getByText('Length unknown')).toBeInTheDocument(); // Fallback
      expect(screen.getByText(/For more information/)).toBeInTheDocument(); // App promotion

      // Should not display missing sections
      expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      expect(screen.queryByText('Highlights:')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    
    test('should handle malformed translation objects gracefully', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const malformedItinerary = {
        type: 'itinerary' as const,
        id: 'malformed-translations',
        data: null,
        feature: {
          properties: {
            id: "malformed-translations",
            itineraryId: "MAL1",
            name: "Malformed Translations Test",
            description: "Fallback description",
            highlights: "Fallback highlights",
            translatedDesc: null, // Malformed
            translatedHighlights: "not an object" // Malformed
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={malformedItinerary}
        />
      );

      // Should fallback to original content
      expect(screen.getByText('Fallback description')).toBeInTheDocument();
      expect(screen.getByText('Fallback highlights')).toBeInTheDocument();
    });

    test('should handle empty string content appropriately', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const emptyContentItinerary = {
        type: 'itinerary' as const,
        id: 'empty-content',
        data: null,
        feature: {
          properties: {
            id: "empty-content",
            itineraryId: "EMPTY1",
            name: "Empty Content Test",
            description: "", // Empty string
            highlights: "   ", // Whitespace only
            translatedDesc: {
              "en": ""
            },
            translatedHighlights: {
              "en": "   "
            }
          }
        }
      };

      render(
        <DetailSidebar
          isOpen={true}
          onClose={() => {}}
          selectedFeature={emptyContentItinerary}
        />
      );

      // The current implementation treats empty strings as falsy but whitespace as truthy
      // Empty string description should not be displayed
      expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      
      // Whitespace-only highlights will be displayed (current behavior)
      expect(screen.getByText('Highlights:')).toBeInTheDocument();
      
      // The highlights content area will contain whitespace
      const highlightsContent = screen.getByText('Highlights:').closest('div')?.querySelector('p');
      expect(highlightsContent?.textContent?.trim()).toBe('');
    });
  });

  describe('Regression Tests', () => {
    
    test('should not break existing itinerary functionality', () => {
      mockUseLanguage.mockReturnValue({ language: 'en' });
      
      const standardItinerary = {
        type: 'itinerary' as const,
        id: 'regression-test',
        data: null,
        feature: {
          properties: {
            id: "regression-test",
            itineraryId: "REG1",
            name: "Regression Test Itinerary",
            trackPackName: "Regression Track Pack",
            lengthKM: 500,
            lengthDays: 5,
            description: "Regression test description",
            highlights: "Regression test highlights"
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
          selectedFeature={standardItinerary}
          onItineraryZoom={mockOnItineraryZoom}
        />
      );

      // Verify all existing functionality still works
      expect(screen.getByText('Regression Track Pack')).toBeInTheDocument();
      expect(screen.getByText('REG1: Regression Test Itinerary')).toBeInTheDocument();
      expect(screen.getByText('500 km, 5 days')).toBeInTheDocument();
      
      // Verify zoom button still works
      const zoomButton = screen.getByText('Zoom to location');
      expect(zoomButton).toBeInTheDocument();
      expect(zoomButton.closest('button')).not.toBeDisabled();
      
      // Verify app store links still work
      expect(screen.getByText('App Store')).toBeInTheDocument();
      expect(screen.getByText('Play Store')).toBeInTheDocument();
      
      // Verify new functionality is added
      expect(screen.getByText('Description:')).toBeInTheDocument();
      expect(screen.getByText('Regression test description')).toBeInTheDocument();
      expect(screen.getByText('Highlights:')).toBeInTheDocument();
      expect(screen.getByText('Regression test highlights')).toBeInTheDocument();
    });
  });
});