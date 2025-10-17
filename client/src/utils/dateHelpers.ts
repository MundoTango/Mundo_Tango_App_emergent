// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Date utilities for safe date parsing and formatting

import { format as dateFnsFormat, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date string or Date object, returning a fallback if invalid
 * @param date - The date to format (string, Date, or null/undefined)
 * @param formatStr - The format string for date-fns (default: 'MMM dd, yyyy')
 * @param fallback - What to return if date is invalid (default: 'Date TBA')
 */
export function safeFormatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM dd, yyyy',
  fallback: string = 'Date TBA'
): string {
  if (!date) return fallback;

  try {
    let dateObj: Date;
    
    // Handle different input types
    if (typeof date === 'string') {
      // Try to parse ISO string
      dateObj = parseISO(date);
      
      // If ISO parsing fails, try direct Date constructor
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return fallback;
    }
    
    // Check if the date is valid
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to safeFormatDate:', date);
      return fallback;
    }
    
    // Format the date
    return dateFnsFormat(dateObj, formatStr);
  } catch (error) {
    console.warn('Error formatting date:', error, 'Date:', date);
    return fallback;
  }
}

/**
 * Safely formats time from a date, returning a fallback if invalid
 * @param date - The date to extract time from
 * @param fallback - What to return if invalid (default: '20:00')
 */
export function safeFormatTime(
  date: string | Date | null | undefined,
  fallback: string = '20:00'
): string {
  return safeFormatDate(date, 'HH:mm', fallback);
}

/**
 * Safely formats date and time together
 * @param date - The date to format
 * @param fallback - What to return if invalid
 */
export function safeFormatDateTime(
  date: string | Date | null | undefined,
  fallback: string = 'Date & Time TBA'
): string {
  return safeFormatDate(date, 'MMM dd, yyyy \'at\' HH:mm', fallback);
}

/**
 * Check if a date string or Date object is valid
 * @param date - The date to validate
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return false;
    }
    
    return isValid(dateObj);
  } catch {
    return false;
  }
}