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
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Globe2, Check, Languages } from 'lucide-react';
import { changeLanguage } from '@/lib/i18n';
import { 
  allSupportedLanguages, 
  getTangoLanguages,
  getPrimaryLanguages, 
  getLanguagesByRegion,
  getLanguageByCode 
} from '@/lib/i18n-languages';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'list';
  showFlags?: boolean;
  groupByRegion?: boolean;
  className?: string;
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

  const handleLanguageChange = async (languageCode: string) => {
    setIsChanging(true);
    try {
      // Change language with dynamic loading
      await changeLanguage(languageCode);
      
      const langData = getLanguageByCode(languageCode);
      const langName = langData?.name || languageCode;
      
      toast({
        title: 'Language Changed',
        description: `Language changed to ${langName}`,
      });
    } catch (error) {
      toast({
        title: 'Language Change Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getLanguageGroups = () => {
    const groups: Record<string, typeof allSupportedLanguages> = {};
    
    // Tango languages first (top languages for tango community)
    const tango = getTangoLanguages();
    if (tango.length > 0) {
      groups['Tango Languages'] = tango;
    }
    
    // European languages
    const europe = getLanguagesByRegion('europe');
    if (europe.length > 0) {
      groups['Europe'] = europe;
    }
    
    // Americas
    const americas = getLanguagesByRegion('americas');
    if (americas.length > 0) {
      groups['Americas'] = americas;
    }
    
    // Asia
    const asia = getLanguagesByRegion('asia');
    if (asia.length > 0) {
      groups['Asia'] = asia;
    }
    
    // Middle East & Africa
    const mea = getLanguagesByRegion('mea');
    if (mea.length > 0) {
      groups['Middle East & Africa'] = mea;
    }
    
    return groups;
  };

  const renderLanguageItem = (lang: typeof allSupportedLanguages[0], isSelected: boolean, isTango: boolean = false) => (
    <DropdownMenuItem
      key={lang.code}
      onClick={() => handleLanguageChange(lang.code)}
      className="flex items-center justify-between cursor-pointer"
      disabled={isChanging}
    >
      {isTango ? (
        // Tango languages: Just flag and checkmark
        <>
          {showFlags && <span className="text-3xl">{lang.flag}</span>}
          {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
        </>
      ) : (
        // Regional languages: Flag with text
        <>
          <div className="flex items-center gap-2">
            {showFlags && <span className="text-lg">{lang.flag}</span>}
            <div className="flex flex-col">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
            </div>
          </div>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </>
      )}
    </DropdownMenuItem>
  );

  if (variant === 'list') {
    const groups = groupByRegion ? getLanguageGroups() : { 'All Languages': allSupportedLanguages };
    
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Languages className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Choose Language</h3>
        </div>
        
        {Object.entries(groups).map(([groupName, languages]) => (
          <div key={groupName} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              {groupName}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.map(lang => {
                const isSelected = i18n.language === lang.code;
                return (
                  <Button
                    key={lang.code}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange(lang.code)}
                    disabled={isChanging}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {showFlags && <span className={groupName === 'Tango Languages' ? 'text-2xl' : ''}>{lang.flag}</span>}
                      <span>{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4" />}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Dropdown variant
  const groups = groupByRegion ? getLanguageGroups() : { 'All Languages': allSupportedLanguages };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-2 ${className}`}
          disabled={isChanging}
        >
          <Globe2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {getLanguageByCode(i18n.language)?.nativeName || 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Choose Language</span>
          <Badge variant="secondary" className="text-xs">
            {allSupportedLanguages.length} languages
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groups).map(([groupName, languages], groupIndex) => (
          <div key={groupName}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            
            {/* Tango Languages - Show flat at top */}
            {groupName === 'Tango Languages' ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                  {groupName}
                </DropdownMenuLabel>
                {languages.map(lang => 
                  renderLanguageItem(lang, i18n.language === lang.code, true)
                )}
              </>
            ) : groupByRegion ? (
              /* Regional languages - Show in submenus */
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="font-semibold">{groupName}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {languages.length}
                  </Badge>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
                    {languages.map(lang => 
                      renderLanguageItem(lang, i18n.language === lang.code, false)
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ) : (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {groupName} ({languages.length})
                </DropdownMenuLabel>
                {languages.map(lang => 
                  renderLanguageItem(lang, i18n.language === lang.code, false)
                )}
              </>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
