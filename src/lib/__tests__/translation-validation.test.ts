/**
 * Tests for translation field validation helpers
 * These tests verify the border post detail consistency fix
 */

describe('Translation Field Validation Helpers', () => {
  // Helper functions (copied from DetailSidebar.tsx)
  const isValidTranslationField = (translations: any): translations is Record<string, string> => {
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
      return false;
    }
    
    // Check if all values are strings
    return Object.values(translations).every(value => typeof value === 'string');
  };

  const getTranslatedFieldValue = (
    translations: any, 
    originalValue: any, 
    currentLanguage: string
  ): string | null => {
    // Return null if no valid content exists
    if (!originalValue && (!translations || !isValidTranslationField(translations))) {
      return null;
    }

    // If translations exist and are valid, try to get translated value
    if (isValidTranslationField(translations)) {
      // Try current language first
      if (translations[currentLanguage] && typeof translations[currentLanguage] === 'string') {
        return translations[currentLanguage];
      }
      
      // Fallback to English
      if (translations['en'] && typeof translations['en'] === 'string') {
        return translations['en'];
      }
    }

    // Fallback to original value if it's a valid string
    if (typeof originalValue === 'string' && originalValue.trim().length > 0) {
      return originalValue;
    }

    return null;
  };

  const validateTranslationStructure = (data: any): { 
    hasValidTranslations: boolean; 
    hasValidOriginal: boolean; 
    warnings: string[] 
  } => {
    const warnings: string[] = [];
    const hasValidTranslations = isValidTranslationField(data?.comment_translations);
    const hasValidOriginal = typeof data?.comment === 'string' && data.comment.trim().length > 0;

    if (data?.comment_translations && !hasValidTranslations) {
      warnings.push('comment_translations field exists but is malformed');
    }

    if (!hasValidTranslations && !hasValidOriginal) {
      warnings.push('No valid comment data available');
    }

    return {
      hasValidTranslations,
      hasValidOriginal,
      warnings
    };
  };

  describe('isValidTranslationField', () => {
    it('should return true for valid translation objects', () => {
      expect(isValidTranslationField({
        en: 'English comment',
        fr: 'Commentaire français',
        de: 'Deutscher Kommentar'
      })).toBe(true);

      expect(isValidTranslationField({
        en: 'Single language'
      })).toBe(true);

      expect(isValidTranslationField({})).toBe(true); // Empty object is valid
    });

    it('should return false for invalid translation objects', () => {
      expect(isValidTranslationField({
        en: 'Valid string',
        fr: 123 // Invalid: number instead of string
      })).toBe(false);

      expect(isValidTranslationField({
        en: 'Valid string',
        fr: null // Invalid: null instead of string
      })).toBe(false);

      expect(isValidTranslationField({
        en: 'Valid string',
        fr: undefined // Invalid: undefined instead of string
      })).toBe(false);

      expect(isValidTranslationField({
        en: 'Valid string',
        fr: {} // Invalid: object instead of string
      })).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isValidTranslationField(null)).toBe(false);
      expect(isValidTranslationField(undefined)).toBe(false);
      expect(isValidTranslationField('string')).toBe(false);
      expect(isValidTranslationField(123)).toBe(false);
      expect(isValidTranslationField([])).toBe(false);
      expect(isValidTranslationField(true)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isValidTranslationField(['en', 'fr'])).toBe(false);
      expect(isValidTranslationField([{ en: 'test' }])).toBe(false);
    });
  });

  describe('getTranslatedFieldValue', () => {
    it('should return current language translation when available', () => {
      const translations = {
        en: 'English comment',
        fr: 'Commentaire français',
        de: 'Deutscher Kommentar'
      };

      expect(getTranslatedFieldValue(translations, 'Original', 'fr')).toBe('Commentaire français');
      expect(getTranslatedFieldValue(translations, 'Original', 'de')).toBe('Deutscher Kommentar');
      expect(getTranslatedFieldValue(translations, 'Original', 'en')).toBe('English comment');
    });

    it('should fallback to English when current language not available', () => {
      const translations = {
        en: 'English comment',
        fr: 'Commentaire français'
      };

      expect(getTranslatedFieldValue(translations, 'Original', 'de')).toBe('English comment');
      expect(getTranslatedFieldValue(translations, 'Original', 'es')).toBe('English comment');
    });

    it('should fallback to original value when no translations available', () => {
      expect(getTranslatedFieldValue(null, 'Original comment', 'fr')).toBe('Original comment');
      expect(getTranslatedFieldValue(undefined, 'Original comment', 'fr')).toBe('Original comment');
      expect(getTranslatedFieldValue({}, 'Original comment', 'fr')).toBe('Original comment');
    });

    it('should return null when no valid content exists', () => {
      expect(getTranslatedFieldValue(null, null, 'fr')).toBe(null);
      expect(getTranslatedFieldValue(undefined, undefined, 'fr')).toBe(null);
      expect(getTranslatedFieldValue({}, '', 'fr')).toBe(null);
      expect(getTranslatedFieldValue({}, '   ', 'fr')).toBe(null);
    });

    it('should handle malformed translation objects gracefully', () => {
      const malformedTranslations = {
        en: 'Valid string',
        fr: 123, // Invalid: number
        de: null // Invalid: null
      };

      expect(getTranslatedFieldValue(malformedTranslations, 'Original', 'fr')).toBe('Original');
      expect(getTranslatedFieldValue(malformedTranslations, 'Original', 'de')).toBe('Original');
    });

    it('should handle empty string values in translations', () => {
      const translations = {
        en: '',
        fr: 'Valid French'
      };

      expect(getTranslatedFieldValue(translations, 'Original', 'en')).toBe('Original');
      expect(getTranslatedFieldValue(translations, 'Original', 'fr')).toBe('Valid French');
    });
  });

  describe('validateTranslationStructure', () => {
    it('should validate data with valid translations and original', () => {
      const data = {
        comment: 'Original comment',
        comment_translations: {
          en: 'English comment',
          fr: 'Commentaire français'
        }
      };

      const result = validateTranslationStructure(data);
      expect(result.hasValidTranslations).toBe(true);
      expect(result.hasValidOriginal).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate data with only original comment', () => {
      const data = {
        comment: 'Original comment'
      };

      const result = validateTranslationStructure(data);
      expect(result.hasValidTranslations).toBe(false);
      expect(result.hasValidOriginal).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate data with only valid translations', () => {
      const data = {
        comment_translations: {
          en: 'English comment',
          fr: 'Commentaire français'
        }
      };

      const result = validateTranslationStructure(data);
      expect(result.hasValidTranslations).toBe(true);
      expect(result.hasValidOriginal).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about malformed translations', () => {
      const data = {
        comment: 'Original comment',
        comment_translations: {
          en: 'Valid string',
          fr: 123 // Invalid: number
        }
      };

      const result = validateTranslationStructure(data);
      expect(result.hasValidTranslations).toBe(false);
      expect(result.hasValidOriginal).toBe(true);
      expect(result.warnings).toContain('comment_translations field exists but is malformed');
    });

    it('should warn when no valid comment data exists', () => {
      const data = {
        comment: '',
        comment_translations: null
      };

      const result = validateTranslationStructure(data);
      expect(result.hasValidTranslations).toBe(false);
      expect(result.hasValidOriginal).toBe(false);
      expect(result.warnings).toContain('No valid comment data available');
    });

    it('should handle empty or null data gracefully', () => {
      expect(() => validateTranslationStructure(null)).not.toThrow();
      expect(() => validateTranslationStructure(undefined)).not.toThrow();
      expect(() => validateTranslationStructure({})).not.toThrow();

      const nullResult = validateTranslationStructure(null);
      expect(nullResult.hasValidTranslations).toBe(false);
      expect(nullResult.hasValidOriginal).toBe(false);
      expect(nullResult.warnings).toContain('No valid comment data available');
    });
  });

  describe('Property-based tests for translation handling', () => {
    it('Property 1: Translation fallback chain - should follow proper fallback order', () => {
      const testCases = [
        {
          translations: { en: 'English', fr: 'French', de: 'German' },
          original: 'Original',
          language: 'fr',
          expected: 'French'
        },
        {
          translations: { en: 'English', de: 'German' },
          original: 'Original',
          language: 'fr', // Not available, should fallback to English
          expected: 'English'
        },
        {
          translations: { de: 'German' },
          original: 'Original',
          language: 'fr', // Not available, no English, should fallback to original
          expected: 'Original'
        },
        {
          translations: null,
          original: 'Original',
          language: 'fr',
          expected: 'Original'
        },
        {
          translations: null,
          original: null,
          language: 'fr',
          expected: null
        }
      ];

      testCases.forEach(({ translations, original, language, expected }) => {
        const result = getTranslatedFieldValue(translations, original, language);
        expect(result).toBe(expected);
      });
    });

    it('Property 2: Validation robustness - should handle all malformed data gracefully', () => {
      const malformedData = [
        { comment_translations: 'not an object' },
        { comment_translations: [] },
        { comment_translations: { en: 123 } },
        { comment_translations: { en: null } },
        { comment_translations: { en: undefined } },
        { comment_translations: { en: {} } },
        null,
        undefined,
        'string',
        123,
        []
      ];

      malformedData.forEach(data => {
        expect(() => validateTranslationStructure(data)).not.toThrow();
        expect(() => isValidTranslationField(data?.comment_translations)).not.toThrow();
        expect(() => getTranslatedFieldValue(data?.comment_translations, data?.comment, 'en')).not.toThrow();
      });
    });

    it('Property 3: Type safety - should maintain type safety for all inputs', () => {
      const edgeCases = [
        null,
        undefined,
        '',
        0,
        false,
        {},
        [],
        { nested: { object: 'value' } },
        new Date(),
        /regex/,
        Symbol('test')
      ];

      edgeCases.forEach(edgeCase => {
        // Should not throw errors
        expect(() => isValidTranslationField(edgeCase)).not.toThrow();
        expect(() => getTranslatedFieldValue(edgeCase, 'original', 'en')).not.toThrow();
        expect(() => validateTranslationStructure({ comment_translations: edgeCase })).not.toThrow();
      });
    });
  });
});

