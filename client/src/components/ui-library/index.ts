// MT Ocean Component Library Index
// ESA LIFE CEO 61x21 UI Components

// Buttons
export { default as MTButton } from './buttons/MTButton';
export type { MTButtonProps } from './buttons/MTButton';

// Cards
export { default as MTCard } from './cards/MTCard';
export type { MTCardProps } from './cards/MTCard';

// Forms - Complete Form Component Suite
export { default as MTForm, MTFormSection, MTFormButton } from './forms/MTForm';
export type { MTFormProps } from './forms/MTForm';

export { default as MTFormField } from './forms/MTFormField';
export type { MTFormFieldProps } from './forms/MTFormField';

export { default as MTFormSelect } from './forms/MTFormSelect';
export type { MTFormSelectProps, MTFormSelectOption } from './forms/MTFormSelect';

export { default as MTFormTextarea } from './forms/MTFormTextarea';
export type { MTFormTextareaProps } from './forms/MTFormTextarea';

export { default as MTFormCheckbox, MTFormCheckboxGroup } from './forms/MTFormCheckbox';
export type { MTFormCheckboxProps, MTFormCheckboxGroupProps } from './forms/MTFormCheckbox';

export { default as MTFormRadioGroup, MTFormRadioCards } from './forms/MTFormRadioGroup';
export type { MTFormRadioGroupProps, MTFormRadioOption } from './forms/MTFormRadioGroup';

export { default as MTFormDatePicker, MTFormDateRangePicker } from './forms/MTFormDatePicker';
export type { MTFormDatePickerProps, MTFormDateRangePickerProps } from './forms/MTFormDatePicker';

export { default as MTFormFileUpload } from './forms/MTFormFileUpload';
export type { MTFormFileUploadProps } from './forms/MTFormFileUpload';

// Legacy form input (deprecated - use MTFormField instead)
export { default as MTInput } from './forms/MTInput';
export type { MTInputProps } from './forms/MTInput';

// Modals
export { default as MTModal } from './modals/MTModal';
export type { MTModalProps } from './modals/MTModal';

// Badges
export { default as MTBadge } from './badges/MTBadge';
export type { MTBadgeProps } from './badges/MTBadge';

// Re-export theme utilities
export * from '@/styles/mt-ocean-theme';