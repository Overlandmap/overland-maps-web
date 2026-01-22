# FAQ Translations

## Structure

The FAQ system supports multiple languages. Each language has its own JSON file:

- `faq-en.json` - English (default)
- `faq-de.json` - German
- `faq-es.json` - Spanish
- `faq-fr.json` - French
- `faq-it.json` - Italian
- `faq-ja.json` - Japanese
- `faq-nl.json` - Dutch
- `faq-ru.json` - Russian

## Translation Status

- ✅ English (en) - Complete
- ⏳ German (de) - Pending
- ⏳ Spanish (es) - Pending
- ⏳ French (fr) - Pending
- ⏳ Italian (it) - Pending
- ⏳ Japanese (ja) - Pending
- ⏳ Dutch (nl) - Pending
- ⏳ Russian (ru) - Pending

## How to Add Translations

1. Copy `faq-en.json` to `faq-{language-code}.json`
2. Translate all `category`, `question`, and `answer` fields
3. Keep markdown links `[text](url)` intact - only translate the text part
4. Maintain the same JSON structure
5. Test the translation by changing the language in the app

## Notes

- The FAQ page automatically loads the appropriate language file based on user preference
- If a translation file is not found, it falls back to English
- Links in answers use markdown format: `[link text](url)`
- External links (http/https) open in new tabs automatically
- Internal links (starting with /) navigate within the app

## Professional Translation Recommended

Given the technical nature and length of the FAQ content, we recommend using professional translation services to ensure accuracy and cultural appropriateness.
