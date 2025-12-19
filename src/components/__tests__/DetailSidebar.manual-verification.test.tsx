import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailSidebar from '../DetailSidebar';

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

describe('DetailSidebar Manual Verification Tests', () => {
  
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
  });

  afterEach(() => {
    cleanup();
  });

  test('Manual verification: Description and highlights sections are properly implemented', () => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
    
    // Test data that mimics real itinerary structure
    const testItinerary = {
      type: 'itinerary' as const,
      id: 'manual-verification',
      data: null,
      feature: {
        properties: {
          id: "manual-verification",
          itineraryId: "MV1",
          name: "Manual Verification Itinerary",
          trackPackName: "Test Track Pack",
          lengthKM: 150,
          lengthDays: 3,
          description: "This is a test description for manual verification.\nIt has multiple lines to test formatting.\nThird line of description.",
          highlights: "First highlight point.\nSecond highlight point.\nThird highlight point.",
          translatedDesc: {
            "fr": "Ceci est une description de test pour la vérification manuelle.\nElle a plusieurs lignes pour tester le formatage.\nTroisième ligne de description."
          },
          translatedHighlights: {
            "fr": "Premier point fort.\nDeuxième point fort.\nTroisième point fort."
          }
        }
      }
    };

    render(
      <DetailSidebar
        isOpen={true}
        onClose={() => {}}
        selectedFeature={testItinerary}
      />
    );

    // Verify basic itinerary information
    expect(screen.getByText('Test Track Pack')).toBeInTheDocument();
    expect(screen.getByText('MV1: Manual Verification Itinerary')).toBeInTheDocument();
    expect(screen.getByText('150 km, 3 days')).toBeInTheDocument();

    // Verify description section
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText(/This is a test description for manual verification/)).toBeInTheDocument();
    expect(screen.getByText(/multiple lines to test formatting/)).toBeInTheDocument();
    expect(screen.getByText(/Third line of description/)).toBeInTheDocument();

    // Verify highlights section
    expect(screen.getByText('Highlights:')).toBeInTheDocument();
    expect(screen.getByText(/First highlight point/)).toBeInTheDocument();
    expect(screen.getByText(/Second highlight point/)).toBeInTheDocument();
    expect(screen.getByText(/Third highlight point/)).toBeInTheDocument();

    // Verify styling classes are applied
    const descriptionContent = screen.getByText(/This is a test description for manual verification/);
    expect(descriptionContent).toHaveClass('whitespace-pre-line');
    expect(descriptionContent.closest('div')).toHaveClass('bg-gray-50');

    const highlightsContent = screen.getByText(/First highlight point/);
    expect(highlightsContent).toHaveClass('whitespace-pre-line');
    expect(highlightsContent.closest('div')).toHaveClass('bg-blue-50');

    console.log('✅ Manual verification: Description and highlights sections are working correctly');
    console.log('✅ Manual verification: Styling and formatting are applied correctly');
    console.log('✅ Manual verification: Line breaks are preserved with whitespace-pre-line class');
  });

  test('Manual verification: French translations work correctly', () => {
    mockUseLanguage.mockReturnValue({ language: 'fr' });
    
    const testItinerary = {
      type: 'itinerary' as const,
      id: 'french-verification',
      data: null,
      feature: {
        properties: {
          id: "french-verification",
          itineraryId: "FR1",
          name: "French Verification Itinerary",
          description: "English description fallback",
          highlights: "English highlights fallback",
          translatedDesc: {
            "fr": "Description française avec plusieurs lignes.\nDeuxième ligne en français.\nTroisième ligne en français."
          },
          translatedHighlights: {
            "fr": "Premier point fort français.\nDeuxième point fort français."
          }
        }
      }
    };

    render(
      <DetailSidebar
        isOpen={true}
        onClose={() => {}}
        selectedFeature={testItinerary}
      />
    );

    // Verify French content is displayed
    expect(screen.getByText(/Description française avec plusieurs lignes/)).toBeInTheDocument();
    expect(screen.getByText(/Deuxième ligne en français/)).toBeInTheDocument();
    expect(screen.getByText(/Premier point fort français/)).toBeInTheDocument();
    expect(screen.getByText(/Deuxième point fort français/)).toBeInTheDocument();

    // Verify English fallback is NOT displayed
    expect(screen.queryByText('English description fallback')).not.toBeInTheDocument();
    expect(screen.queryByText('English highlights fallback')).not.toBeInTheDocument();

    console.log('✅ Manual verification: French translations are working correctly');
    console.log('✅ Manual verification: Translation fallback logic is working correctly');
  });

  test('Manual verification: Layout positioning is correct', () => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
    
    const testItinerary = {
      type: 'itinerary' as const,
      id: 'layout-verification',
      data: null,
      feature: {
        properties: {
          id: "layout-verification",
          itineraryId: "LV1",
          name: "Layout Verification Itinerary",
          trackPackName: "Layout Test Pack",
          lengthKM: 200,
          lengthDays: 4,
          description: "Layout test description",
          highlights: "Layout test highlights"
        }
      }
    };

    render(
      <DetailSidebar
        isOpen={true}
        onClose={() => {}}
        selectedFeature={testItinerary}
      />
    );

    // Get the container and verify order
    const container = document.body;
    const textContent = container.textContent || '';

    // Verify correct order of elements
    const trackPackIndex = textContent.indexOf('Layout Test Pack');
    const itineraryNameIndex = textContent.indexOf('LV1: Layout Verification Itinerary');
    const lengthIndex = textContent.indexOf('200 km, 4 days');
    const descriptionIndex = textContent.indexOf('Description:');
    const highlightsIndex = textContent.indexOf('Highlights:');
    const appPromotionIndex = textContent.indexOf('For more information');

    expect(trackPackIndex).toBeLessThan(itineraryNameIndex);
    expect(itineraryNameIndex).toBeLessThan(lengthIndex);
    expect(lengthIndex).toBeLessThan(descriptionIndex);
    expect(descriptionIndex).toBeLessThan(highlightsIndex);
    expect(highlightsIndex).toBeLessThan(appPromotionIndex);

    console.log('✅ Manual verification: Layout positioning is correct');
    console.log('✅ Manual verification: Description and highlights are positioned before mobile app promotion');
  });

  test('Manual verification: No regressions in existing functionality', () => {
    mockUseLanguage.mockReturnValue({ language: 'en' });
    
    const testItinerary = {
      type: 'itinerary' as const,
      id: 'regression-verification',
      data: null,
      feature: {
        properties: {
          id: "regression-verification",
          itineraryId: "RV1",
          name: "Regression Verification Itinerary",
          trackPackName: "Regression Test Pack",
          lengthKM: 300,
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
        selectedFeature={testItinerary}
        onItineraryZoom={mockOnItineraryZoom}
      />
    );

    // Verify all existing functionality still works
    expect(screen.getByText('Regression Test Pack')).toBeInTheDocument();
    expect(screen.getByText('RV1: Regression Verification Itinerary')).toBeInTheDocument();
    expect(screen.getByText('300 km, 5 days')).toBeInTheDocument();
    
    // Verify zoom button still works
    const zoomButton = screen.getByText('Zoom to location');
    expect(zoomButton).toBeInTheDocument();
    expect(zoomButton.closest('button')).not.toBeDisabled();
    
    // Verify app store links still work
    expect(screen.getByText('App Store')).toBeInTheDocument();
    expect(screen.getByText('Play Store')).toBeInTheDocument();
    
    // Verify new functionality is added without breaking existing
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Regression test description')).toBeInTheDocument();
    expect(screen.getByText('Highlights:')).toBeInTheDocument();
    expect(screen.getByText('Regression test highlights')).toBeInTheDocument();

    console.log('✅ Manual verification: No regressions detected in existing functionality');
    console.log('✅ Manual verification: New description and highlights features integrated successfully');
  });
});