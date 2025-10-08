import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface InlineValidationProps {
  value: string;
  rules: ValidationRule[];
  touched?: boolean;
  helpText?: string;
}

export const InlineValidation = ({ 
  value, 
  rules, 
  touched = false,
  helpText 
}: InlineValidationProps) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validationErrors: string[] = [];
    
    rules.forEach(rule => {
      if (value && !rule.validate(value)) {
        validationErrors.push(rule.message);
      }
    });

    setErrors(validationErrors);
    setIsValid(value.length > 0 && validationErrors.length === 0);
  }, [value, rules]);

  if (!touched && !value) {
    return helpText ? (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 mt-2 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400"
       
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{helpText}</span>
      </motion.div>
    ) : null;
  }

  return (
    <AnimatePresence mode="wait">
      {errors.length > 0 && touched && (
        <motion.div
          key="errors"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-2"
         
        >
          {errors.map((error, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </motion.div>
      )}
      
      {isValid && touched && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400"
         
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Looks good!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const emailValidation: ValidationRule[] = [
  {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }
];

export const passwordValidation: ValidationRule[] = [
  {
    validate: (value) => value.length >= 8,
    message: 'Password must be at least 8 characters'
  },
  {
    validate: (value) => /[A-Z]/.test(value),
    message: 'Must contain at least one uppercase letter'
  },
  {
    validate: (value) => /[a-z]/.test(value),
    message: 'Must contain at least one lowercase letter'
  },
  {
    validate: (value) => /[0-9]/.test(value),
    message: 'Must contain at least one number'
  }
];

export const nameValidation: ValidationRule[] = [
  {
    validate: (value) => value.length >= 2,
    message: 'Name must be at least 2 characters'
  },
  {
    validate: (value) => /^[a-zA-Z\s'-]+$/.test(value),
    message: 'Name can only contain letters, spaces, hyphens and apostrophes'
  }
];
