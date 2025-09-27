# Translation Generation Scripts Documentation

## Overview
- **Location:** `server/scripts/` directory
- **Purpose:** Automated translation generation and testing for 65 production languages
- **ESA Framework Layer:** Layer 53 - Internationalization & Translation System Agent
- **Technology:** OpenAI GPT-4o-mini API for high-quality translations

## Translation Scripts

### 1. generateTranslations.ts
**Purpose:** Generate translations for specific languages using OpenAI API

```bash
# Basic usage - translate to specific languages
npx tsx server/scripts/generateTranslations.ts --languages=es-AR-lunfardo,it,fr

# Force overwrite existing translations
npx tsx server/scripts/generateTranslations.ts --languages=de,ja --force

# Dry run without saving (test mode)
npx tsx server/scripts/generateTranslations.ts --languages=ar,he --test
```

**Options:**
- `--languages`: Comma-separated list of language codes to translate
- `--force`: Overwrite existing translations (default: false)
- `--test`: Perform dry run without saving to file (default: false)
- `--verbose`: Show detailed translation process (default: false)

**Features:**
- Rate limiting protection (3 requests per second)
- Cultural context preservation
- Fallback to English if translation fails
- Progress indicators for batch processing

### 2. generateTranslationsBatch.ts  
**Purpose:** Generate translations for all 65 languages in regional batches

```bash
# Generate all 65 languages in optimized batches
npx tsx server/scripts/generateTranslationsBatch.ts

# Process specific region only
npx tsx server/scripts/generateTranslationsBatch.ts --region=europe
npx tsx server/scripts/generateTranslationsBatch.ts --region=asia

# Resume from specific batch if interrupted
npx tsx server/scripts/generateTranslationsBatch.ts --start-from=asia
```

**Regional Processing Order:**
1. **Primary Languages (6):** en, es-AR-lunfardo, it, fr, ko, zh
2. **European Languages (32):** Germanic, Romance, Slavic, Baltic groups
3. **Americas Languages (3):** pt-BR, es-MX, fr-CA
4. **Asian Languages (17):** East, South, Southeast Asian languages
5. **Middle East & Africa (7):** RTL languages and African languages

**Features:**
- Automatic batch processing with 2-second delays between languages
- Regional grouping for efficient API usage
- Progress tracking with completion percentages
- Automatic retry on failure (3 attempts)
- Checkpoint saving for resume capability

### 3. testLanguageSwitching.ts
**Purpose:** Verify translation completeness and quality for all languages

```bash
# Run complete translation test suite
npx tsx server/scripts/testLanguageSwitching.ts

# Test specific language
npx tsx server/scripts/testLanguageSwitching.ts --language=es-AR-lunfardo

# Test only RTL languages
npx tsx server/scripts/testLanguageSwitching.ts --rtl-only

# Generate detailed report
npx tsx server/scripts/testLanguageSwitching.ts --detailed
```

**Test Coverage:**
- ✅ Navigation translations for "Memories" across sample languages
- ✅ Complete translation coverage (65/65 languages)
- ✅ RTL language direction flags (ar, he, fa, ur)
- ✅ Cultural appropriateness spot checks
- ✅ Key navigation elements presence
- ✅ Common UI strings validation

**Output Example:**
```
🌍 ESA Layer 53: Language Translation Test
==========================================

📊 Testing Navigation Translations for "Memories":
✅ English (en): "Memories"
✅ Argentine Spanish (Lunfardo) (es-AR-lunfardo): "Recuerdos"
✅ Italian (it): "Ricordi"
✅ Arabic (ar): "ذكريات"

📊 Summary:
   Total languages in file: 65
   Tests passed: 65/65
   RTL Support: 4/4 configured

✨ ESA Layer 53 Translation Test Complete!
```

### 4. verifyTranslations.ts (Helper Script)
**Purpose:** Deep validation of translation quality and consistency

```bash
# Check for missing keys across all languages
npx tsx server/scripts/verifyTranslations.ts --check-missing

# Validate translation lengths (for UI fitting)
npx tsx server/scripts/verifyTranslations.ts --check-length

# Compare translations with base English
npx tsx server/scripts/verifyTranslations.ts --compare-base
```

## Integration with Translation Service

### Server Translation Service
```typescript
// server/services/translationService.ts

class TranslationService {
  private openai: OpenAI;
  private cache: Map<string, any>;
  
  async translateText(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    // OpenAI GPT-4o-mini translation
    // With cultural context preservation
    // And caching for performance
  }
  
  async translateBatch(
    texts: string[],
    targetLanguage: string
  ): Promise<string[]> {
    // Batch translation with rate limiting
    // Optimized for multiple strings
  }
}
```

## Command Reference

### Quick Commands for Common Tasks

#### Add New Language
```bash
# 1. Add language to config
# Edit client/src/i18n/config.ts - add to supportedLanguages array

# 2. Generate translations
npx tsx server/scripts/generateTranslations.ts --languages=NEW_CODE

# 3. Test the new language
npx tsx server/scripts/testLanguageSwitching.ts --language=NEW_CODE
```

#### Update Existing Translations
```bash
# Force regenerate specific language
npx tsx server/scripts/generateTranslations.ts --languages=es-AR-lunfardo --force

# Regenerate all languages (careful - uses API quota)
npx tsx server/scripts/generateTranslationsBatch.ts --force
```

#### Fix Translation Issues
```bash
# Fix Swahili/Swedish conflict
npx tsx server/scripts/generateTranslations.ts --languages=sw --force

# Regenerate RTL languages
npx tsx server/scripts/generateTranslations.ts --languages=ar,he,fa,ur --force
```

## Environment Variables

Required environment variables for translation scripts:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini  # Default model for translations
OPENAI_MAX_TOKENS=2000     # Max tokens per translation request

# Rate Limiting
TRANSLATION_RATE_LIMIT=3   # Requests per second
TRANSLATION_BATCH_SIZE=10  # Translations per batch

# Caching
TRANSLATION_CACHE_TTL=86400  # Cache duration in seconds (24 hours)
```

## Performance Optimization

### API Usage Optimization
- **Batching:** Process multiple strings in single API call
- **Caching:** Store translations for 24 hours
- **Rate Limiting:** Maximum 3 requests per second
- **Retry Logic:** 3 attempts with exponential backoff

### Cost Management
- **GPT-4o-mini:** ~$0.002 per 1K tokens (80% cheaper than GPT-4)
- **Average Translation:** ~200 tokens per UI string
- **Total Cost Estimate:** ~$5 for all 65 languages complete UI

### Execution Times
| Operation | Time | Languages |
|-----------|------|-----------|
| Single Language | ~30s | 1 |
| Primary Languages | ~3 min | 6 |
| European Batch | ~16 min | 32 |
| Full Generation | ~35 min | 65 |
| Verification Test | ~5s | 65 |

## Troubleshooting

### Common Issues and Solutions

#### OpenAI API Errors
```bash
# Error: Rate limit exceeded
Solution: Reduce TRANSLATION_RATE_LIMIT in environment

# Error: API key invalid
Solution: Check OPENAI_API_KEY environment variable

# Error: Model not found
Solution: Ensure using 'gpt-4o-mini' or valid model name
```

#### Translation Quality Issues
```bash
# Issue: Wrong translations for specific language
npx tsx server/scripts/generateTranslations.ts --languages=LANG_CODE --force

# Issue: Missing cultural context (e.g., Lunfardo)
# Add context in generateTranslations.ts:
context: "Use authentic Buenos Aires Lunfardo slang"
```

#### File System Errors
```bash
# Error: Cannot write translations.json
Solution: Check file permissions on client/src/i18n/

# Error: Translations not loading
Solution: Verify JSON syntax is valid
cat client/src/i18n/translations.json | jq .
```

## Best Practices

### 1. Translation Generation
- Always test translations after generation
- Use `--test` flag first for new languages
- Keep backup of translations.json before bulk updates
- Monitor API usage to avoid quota limits

### 2. Cultural Appropriateness
- Review primary languages manually
- Use native speakers for validation when possible
- Preserve cultural idioms and expressions
- Test RTL languages in actual UI

### 3. Maintenance
- Run verification tests weekly
- Update translations when UI strings change
- Document any manual translation overrides
- Keep translation scripts in version control

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/translations.yml
name: Translation Tests

on:
  push:
    paths:
      - 'client/src/i18n/**'
      - 'server/scripts/**'

jobs:
  test-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx tsx server/scripts/testLanguageSwitching.ts
      - run: npx tsx server/scripts/verifyTranslations.ts --check-missing
```

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
npx tsx server/scripts/testLanguageSwitching.ts --quick
```

## Future Enhancements

### Planned Improvements
1. **Community Translations:** Allow users to suggest improvements
2. **Context-Aware Translation:** Use page context for better translations
3. **Translation Memory:** Reuse common phrases across languages
4. **Quality Scoring:** AI-based translation quality assessment
5. **Dialect Support:** Regional variations (UK vs US English)
6. **Voice Translation:** Support for voice UI in multiple languages

## Related Documentation
- [LanguageSelector Component](/docs/pages/components/LanguageSelector.md)
- [UnifiedTopBar Documentation](/docs/pages/components/UnifiedTopBar.md)
- [ESA Layer 53 Guide](/ESA_LAYER_53_MULTILINGUAL_GUIDE.md)