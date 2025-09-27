import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n/config';

export function useRTL() {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const currentLang = supportedLanguages.find(l => l.code === i18n.language);
    const rtl = currentLang?.direction === 'rtl';
    setIsRTL(rtl);
    
    // Update document direction
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    
    // Add RTL class for Tailwind utilities
    if (rtl) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [i18n.language]);

  return { isRTL, direction: isRTL ? 'rtl' : 'ltr' };
}

// Utility function to get RTL-aware className
export function getRTLClassName(baseClass: string, rtlClass?: string) {
  return `${baseClass} ${rtlClass ? `rtl:${rtlClass}` : ''}`;
}

// Common RTL-aware Tailwind classes
export const rtlClasses = {
  // Text alignment
  textLeft: 'text-left rtl:text-right',
  textRight: 'text-right rtl:text-left',
  textStart: 'text-start',
  textEnd: 'text-end',
  
  // Margin
  marginLeft: (value: string) => `ml-${value} rtl:mr-${value} rtl:ml-0`,
  marginRight: (value: string) => `mr-${value} rtl:ml-${value} rtl:mr-0`,
  marginStart: (value: string) => `ms-${value}`,
  marginEnd: (value: string) => `me-${value}`,
  
  // Padding
  paddingLeft: (value: string) => `pl-${value} rtl:pr-${value} rtl:pl-0`,
  paddingRight: (value: string) => `pr-${value} rtl:pl-${value} rtl:pr-0`,
  paddingStart: (value: string) => `ps-${value}`,
  paddingEnd: (value: string) => `pe-${value}`,
  
  // Positioning
  left: (value: string) => `left-${value} rtl:right-${value} rtl:left-auto`,
  right: (value: string) => `right-${value} rtl:left-${value} rtl:right-auto`,
  start: (value: string) => `start-${value}`,
  end: (value: string) => `end-${value}`,
  
  // Flexbox
  flexRowReverse: 'flex-row-reverse rtl:flex-row',
  flexRow: 'flex-row rtl:flex-row-reverse',
  
  // Border
  borderLeft: (value: string) => `border-l-${value} rtl:border-r-${value} rtl:border-l-0`,
  borderRight: (value: string) => `border-r-${value} rtl:border-l-${value} rtl:border-r-0`,
  borderStart: (value: string) => `border-s-${value}`,
  borderEnd: (value: string) => `border-e-${value}`,
  
  // Rounded corners
  roundedLeft: (value: string) => `rounded-l-${value} rtl:rounded-r-${value} rtl:rounded-l-none`,
  roundedRight: (value: string) => `rounded-r-${value} rtl:rounded-l-${value} rtl:rounded-r-none`,
  roundedTopLeft: (value: string) => `rounded-tl-${value} rtl:rounded-tr-${value} rtl:rounded-tl-none`,
  roundedTopRight: (value: string) => `rounded-tr-${value} rtl:rounded-tl-${value} rtl:rounded-tr-none`,
  roundedBottomLeft: (value: string) => `rounded-bl-${value} rtl:rounded-br-${value} rtl:rounded-bl-none`,
  roundedBottomRight: (value: string) => `rounded-br-${value} rtl:rounded-bl-${value} rtl:rounded-br-none`,
};