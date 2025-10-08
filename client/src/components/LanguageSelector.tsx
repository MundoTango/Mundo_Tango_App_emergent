import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal } from
'@/components/ui/dropdown-menu';
import { Globe2, Check, Languages } from 'lucide-react';
import { changeLanguage, supportedLanguages as supportedLangsConfig } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'list';
  showFlags?: boolean;
  groupByRegion?: boolean;
  className?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  country: string;
  isActive: boolean;
  isLunfardo?: boolean;
  isPrimary?: boolean;
}

interface UserLanguagePreference {
  id: number;
  userId: number;
  primaryLanguage: string;
  additionalLanguages: string[];
  preferredContentLanguages: string[];
  autoTranslate: boolean;
  showOriginalContent: boolean;
  translationQualityThreshold: number;
}

const LanguageSelector = ({
  variant = 'dropdown',
  showFlags = true,
  groupByRegion = true,
  className = ''
}: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  // Get supported languages from config and transform to expected format
  const supportedLanguages: Language[] = supportedLangsConfig.map((lang) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
    country: lang.flag.replace(/[^\w]/g, '').substring(0, 2), // Extract country code from flag emoji
    isActive: true,
    isLunfardo: false,
    isPrimary: lang.code === 'en' || lang.code === 'es'
  }));

  // Default user preferences (can be fetched from API later)
  const userPreferences: UserLanguagePreference | null = null;

  // Track language analytics mutation
  const trackAnalyticsMutation = useMutation({
    mutationFn: (data: {action: string;languageCode: string;metadata?: any;}) =>
    apiRequest('/api/languages/analytics', { method: 'POST', body: data })
  });

  const userLanguages: string[] = [];

  const handleLanguageChange = async (languageCode: string) => {
    setIsChanging(true);
    try {
      // Change language in i18n
      await changeLanguage(languageCode);

      // Skip updating user preferences for now since API doesn't exist yet

      // Analytics tracking disabled - can be re-enabled when backend is available
      // trackAnalyticsMutation.mutate({
      //   action: 'language_changed',
      //   languageCode,
      //   metadata: {
      //     previousLanguage: i18n.language,
      //     source: variant,
      //   },
      // });

      const langName = supportedLanguages.find((l) => l.code === languageCode)?.name || languageCode;
      toast({
        title: 'Language Changed',
        description: `Language changed to ${langName}`
      });
    } catch (error) {
      toast({
        title: 'Language Change Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getLanguageGroups = () => {
    // Group languages by region - only include groups that have languages
    const groups: Record<string, Language[]> = {};

    // Define language codes by region (using all 73 languages from ESA Layer 53)
    const europeCodes = ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'pl', 'ru', 'el', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'ro', 'bg', 'uk', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'is', 'mk', 'mt', 'cy', 'lb', 'ca', 'gl', 'eu', 'sq', 'be', 'bs', 'ka'];
    const americasCodes = ['en', 'es-AR-lunfardo', 'es', 'pt', 'pt-br'];
    const asiaCodes = ['zh', 'zh-tw', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'fil', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ne', 'si', 'lo', 'my'];
    const meaCodes = ['ar', 'he', 'tr', 'fa', 'ur', 'af', 'am', 'ps'];
    // Primary languages (marked as priority in platform)
    const primaryLanguages = supportedLanguages.filter((lang) => lang.isPrimary || lang.code === 'en');
    if (primaryLanguages.length > 0) {
      groups['Primary Languages'] = primaryLanguages;
    }

    const popularCodes = ['en', 'es-AR-lunfardo', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ja', 'ar', 'ko'];

    // Popular languages for quick access
    const popular = supportedLanguages.filter((lang) =>
    popularCodes.includes(lang.code)
    );
    if (popular.length > 0) groups['Popular'] = popular;

    // European languages
    const europe = supportedLanguages.filter((lang) =>
    europeCodes.includes(lang.code)
    );
    if (europe.length > 0) groups['Europe'] = europe;

    // American languages  
    const americas = supportedLanguages.filter((lang) =>
    americasCodes.includes(lang.code)
    );
    if (americas.length > 0) groups['Americas'] = americas;

    // Asian languages
    const asia = supportedLanguages.filter((lang) =>
    asiaCodes.includes(lang.code)
    );
    if (asia.length > 0) groups['Asia'] = asia;

    // Middle East & Africa languages
    const mea = supportedLanguages.filter((lang) =>
    meaCodes.includes(lang.code)
    );
    if (mea.length > 0) groups['Middle East & Africa'] = mea;

    // Always include all languages (if we have any)
    if (supportedLanguages.length > 0) {
      groups['All Languages'] = supportedLanguages;
    }

    return groups;
  };

  const renderLanguageItem = (lang: Language) => {
    const isSelected = i18n.language === lang.code;
    const isUserLanguage = userLanguages.includes(lang.code);

    return (
      <DropdownMenuItem
        key={lang.code}
        onClick={() => handleLanguageChange(lang.code)}
        className="flex items-center justify-between hover:glass-card hover:glass-depth-1 cursor-pointer"
        disabled={isChanging}>

        <div className="flex items-center gap-2">
          {showFlags &&
          <span className="text-xl">{supportedLangsConfig.find((l) => l.code === lang.code)?.flag || '🌍'}</span>
          }
          <div className={isSelected ? 'font-semibold text-[var(--color-primary-hover)] dark:text-cyan-400' : ''}>
            <div>{lang.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{lang.nativeName}</div>
          </div>
          {isUserLanguage &&
          <Badge variant="outline" className="text-xs border-[var(--color-ocean-300)]">
              Preferred
            </Badge>
          }
        </div>
        {isSelected && <Check className="w-4 h-4 text-[var(--color-primary-hover)] dark:text-cyan-400" />}
      </DropdownMenuItem>);

  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode.
    toUpperCase().
    split('').
    map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (variant === 'list') {
    return (
      <div className={`glass-card glass-depth-2 p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-brand-gradient">
          Select Language
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {supportedLanguages.map((lang) =>
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)} aria-label="Button"
            disabled={isChanging}
            className={`
                w-full p-3 rounded-lg text-left transition-all duration-200
                ${i18n.language === lang.code ?
            'glass-card glass-depth-1 border-2 border-[var(--color-ocean-300)] dark:border-cyan-500' :
            'hover:glass-card hover:glass-depth-1 border border-white/20 dark:border-white/10'}
              `
            } data-testid="button-element">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showFlags &&
                <span className="text-2xl">{getFlagEmoji(lang.country)}</span>
                }
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{lang.nativeName}</div>
                  </div>
                </div>
                {i18n.language === lang.code &&
              <Check className="w-5 h-5 text-[var(--color-primary-hover)]" />
              }
              </div>
            </button>
          )}
        </div>
      </div>);

  }

  const languageGroups = getLanguageGroups();
  const currentLanguage = supportedLanguages.find((l) => l.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 hover:glass-card hover:glass-depth-1 transition-all ${className}`}
          disabled={isChanging} data-testid="button-element">

          <Globe2 className="w-4 h-4" />
          {showFlags && currentLanguage &&
          <span className="text-lg">{supportedLangsConfig.find((l) => l.code === currentLanguage.code)?.flag || '🌍'}</span>
          }
          <span className="hidden sm:inline">{currentLanguage?.nativeName || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 glass-card glass-depth-3 border border-white/20 dark:border-white/10" align="end">
        <DropdownMenuLabel className="flex items-center gap-2 text-brand-gradient font-semibold">
          <Languages className="w-4 h-4" />
          Choose Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {groupByRegion ?
        <>
            {/* Primary languages for quick access */}
            {languageGroups['Primary Languages'] && languageGroups['Primary Languages'].length > 0 &&
          <>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-[var(--color-primary-hover)] dark:text-cyan-400 mb-1">✨ Primary Languages</p>
                  {languageGroups['Primary Languages'].map(renderLanguageItem)}
                </div>
                <DropdownMenuSeparator />
              </>
          }
            
            {/* All languages grouped by region */}
            {Object.entries(languageGroups).map(([region, languages]) => {
            if (region === 'Popular' || region === 'All Languages' || languages.length === 0) return null;
            return (
              <DropdownMenuSub key={region}>
                  <DropdownMenuSubTrigger className="hover:glass-card hover:glass-depth-1 cursor-pointer">
                    <span className="flex items-center justify-between w-full">
                      <span>{region}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({languages.length})</span>
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                    className="max-h-96 overflow-y-auto bg-[var(--color-surface)] dark:bg-gray-800 border border-[var(--color-border)] dark:border-gray-700 rounded-md shadow-lg z-[100]"
                    sideOffset={2}
                    alignOffset={-5}>

                      {languages.map(renderLanguageItem)}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>);

          })}
            
            {supportedLanguages.length > 0 &&
          <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="hover:glass-card hover:glass-depth-1 cursor-pointer">
                    <span className="flex items-center justify-between w-full">
                      <span>All Languages</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({supportedLanguages.length})</span>
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                  className="max-h-96 overflow-y-auto bg-[var(--color-surface)] dark:bg-gray-800 border border-[var(--color-border)] dark:border-gray-700 rounded-md shadow-lg z-[100]"
                  sideOffset={2}
                  alignOffset={-5}>

                      {supportedLanguages.map(renderLanguageItem)}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </>
          }
          </> :

        <div className="max-h-96 overflow-y-auto">
            {supportedLanguages.map(renderLanguageItem)}
          </div>
        }
      </DropdownMenuContent>
    </DropdownMenu>);

};

export default LanguageSelector;