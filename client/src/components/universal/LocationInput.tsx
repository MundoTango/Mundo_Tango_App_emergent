// MT ESA LIFE CEO - Location Input Component (Stub)
// TODO: Implement full location input with autocomplete

import { Input } from '@/components/ui/input';

interface LocationInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationInput({ value, onChange, placeholder, className }: LocationInputProps) {
  return (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder || 'Enter location...'}
      className={className}
      data-testid="input-location"
    />
  );
}
