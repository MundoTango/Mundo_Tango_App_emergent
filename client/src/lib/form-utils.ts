// ESA LIFE CEO 61x21 Form Utilities
// Helper functions for form validation and handling

import { FieldError, FieldErrors } from 'react-hook-form';
import { z } from 'zod';

// ========================================
// Error Message Formatting
// ========================================

/**
 * Format field error for display
 */
export function formatFieldError(error: FieldError | undefined): string | undefined {
  if (!error) return undefined;
  
  if (error.type === 'required') {
    return 'This field is required';
  }
  
  return error.message || 'Invalid value';
}

/**
 * Get all form errors as a flat array
 */
export function getAllErrors(errors: FieldErrors): string[] {
  const errorMessages: string[] = [];
  
  const extractErrors = (obj: any, prefix = ''): void => {
    Object.keys(obj).forEach((key) => {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key]?.message) {
        errorMessages.push(`${fieldName}: ${obj[key].message}`);
      } else if (typeof obj[key] === 'object') {
        extractErrors(obj[key], fieldName);
      }
    });
  };
  
  extractErrors(errors);
  return errorMessages;
}

/**
 * Get first error message from form
 */
export function getFirstError(errors: FieldErrors): string | undefined {
  const allErrors = getAllErrors(errors);
  return allErrors[0];
}

// ========================================
// Custom Validators
// ========================================

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format (alphanumeric, underscore, hyphen)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// ========================================
// Field Transformation
// ========================================

/**
 * Transform phone number to international format
 */
export function formatPhoneNumber(phone: string, countryCode = '+1'): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it already has country code, return as is
  if (cleaned.startsWith(countryCode.replace('+', ''))) {
    return `+${cleaned}`;
  }
  
  // Add country code
  return `${countryCode}${cleaned}`;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format = 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const formats = {
    full: { dateStyle: 'long' as const },
    short: { dateStyle: 'short' as const },
    medium: { dateStyle: 'medium' as const },
    datetime: { dateStyle: 'medium' as const, timeStyle: 'short' as const },
  };
  
  return new Intl.DateTimeFormat('en-US', formats[format as keyof typeof formats] || formats.full)
    .format(d);
}

/**
 * Sanitize HTML input
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

// ========================================
// File Validation
// ========================================

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// Form State Management
// ========================================

/**
 * Check if form is dirty (has unsaved changes)
 */
export function hasUnsavedChanges(original: any, current: any): boolean {
  return JSON.stringify(original) !== JSON.stringify(current);
}

/**
 * Reset form with confirmation
 */
export function confirmFormReset(callback: () => void): void {
  if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
    callback();
  }
}

/**
 * Debounce function for form inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ========================================
// Accessibility Helpers
// ========================================

/**
 * Generate field ID for accessibility
 */
export function getFieldId(formId: string, fieldName: string): string {
  return `${formId}-${fieldName}`;
}

/**
 * Generate error ID for accessibility
 */
export function getErrorId(formId: string, fieldName: string): string {
  return `${formId}-${fieldName}-error`;
}

/**
 * Generate description ID for accessibility
 */
export function getDescriptionId(formId: string, fieldName: string): string {
  return `${formId}-${fieldName}-description`;
}

// ========================================
// Zod Schema Helpers
// ========================================

/**
 * Create optional string schema with trimming
 */
export function optionalString() {
  return z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val));
}

/**
 * Create required string schema with trimming
 */
export function requiredString(message = 'This field is required') {
  return z.string().trim().min(1, message);
}

/**
 * Create email schema
 */
export function emailSchema(message = 'Invalid email address') {
  return z.string().email(message);
}

/**
 * Create URL schema
 */
export function urlSchema(message = 'Invalid URL') {
  return z.string().url(message);
}

// ========================================
// Form Submission Helpers
// ========================================

/**
 * Handle form submission with loading state
 */
export async function handleFormSubmit<T>(
  submitFn: (data: T) => Promise<void>,
  data: T,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    finally?: () => void;
  }
): Promise<void> {
  try {
    await submitFn(data);
    options?.onSuccess?.();
  } catch (error) {
    options?.onError?.(error as Error);
    throw error;
  } finally {
    options?.finally?.();
  }
}

/**
 * Retry failed form submission
 */
export async function retrySubmission<T>(
  submitFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await submitFn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}