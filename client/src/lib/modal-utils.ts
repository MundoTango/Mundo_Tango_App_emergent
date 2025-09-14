// MT Ocean Modal Utilities
// ESA LIFE CEO 61x21 - Modal Hooks and Helpers

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useModalStore, modalManager, ModalConfig } from './modal-manager';
import { create } from 'zustand';

// Modal Hook
export interface UseModalOptions {
  id?: string;
  onOpen?: () => void;
  onClose?: () => void;
  preventClose?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export const useModal = (options: UseModalOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalId = useRef(options.id || `modal-${Date.now()}`);
  const { openModal, closeModal, isModalOpen } = useModalStore();

  const open = useCallback((component: ReactNode, props?: Record<string, any>) => {
    if (options.onOpen) options.onOpen();
    
    const id = openModal({
      id: modalId.current,
      component,
      props,
      onClose: () => {
        setIsOpen(false);
        if (options.onClose) options.onClose();
      },
      preventClose: options.preventClose
    });

    modalId.current = id;
    setIsOpen(true);
    return id;
  }, [openModal, options]);

  const close = useCallback(() => {
    closeModal(modalId.current);
    setIsOpen(false);
    if (options.onClose) options.onClose();
  }, [closeModal, options]);

  const toggle = useCallback((component?: ReactNode, props?: Record<string, any>) => {
    if (isOpen) {
      close();
    } else if (component) {
      open(component, props);
    }
  }, [isOpen, open, close]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (options.closeOnEscape !== false && e.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close, options.closeOnEscape]);

  return {
    isOpen,
    open,
    close,
    toggle,
    modalId: modalId.current
  };
};

// Toast Notification System
export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }, toast.duration || 5000);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  }
}));

// Toast hook
export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    return addToast(options);
  }, [addToast]);

  const success = useCallback((title: string, message?: string) => {
    return addToast({ title, message, type: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    return addToast({ title, message, type: 'error' });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    return addToast({ title, message, type: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    return addToast({ title, message, type: 'info' });
  }, [addToast]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    dismissAll: clearToasts
  };
};

// Confirmation Dialog Helper
export const useConfirm = () => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);
  
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger';
  } | null>(null);

  const confirm = useCallback((options: typeof config) => {
    return new Promise<boolean>((resolve) => {
      setConfig(options);
      setPromise({ resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    promise?.resolve(true);
    setPromise(null);
    setConfig(null);
  }, [promise]);

  const handleCancel = useCallback(() => {
    promise?.resolve(false);
    setPromise(null);
    setConfig(null);
  }, [promise]);

  return {
    confirm,
    config,
    isOpen: !!config,
    handleConfirm,
    handleCancel
  };
};

// Focus Management
export const useFocusTrap = (ref: React.RefObject<HTMLElement>, isActive = true) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select', 
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const focusableElements = element.querySelectorAll(focusableSelectors.join(', '));
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref, isActive]);
};

// Scroll Lock
export const useScrollLock = (isLocked = false) => {
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (isLocked) {
      scrollPosition.current = window.pageYOffset;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isLocked]);
};

// Click Outside Handler
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
  isActive = true
) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler, isActive]);
};

// Animation Helpers
export const modalAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  slideFromRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  slideFromLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

// Z-Index Manager
class ZIndexManager {
  private static baseIndex = 1000;
  private static increment = 10;
  private static currentIndex = ZIndexManager.baseIndex;

  static getNextIndex(): number {
    ZIndexManager.currentIndex += ZIndexManager.increment;
    return ZIndexManager.currentIndex;
  }

  static reset(): void {
    ZIndexManager.currentIndex = ZIndexManager.baseIndex;
  }
}

export const zIndexManager = ZIndexManager;

// Export all utilities
export const modalUtils = {
  useModal,
  useToast,
  useConfirm,
  useFocusTrap,
  useScrollLock,
  useClickOutside,
  modalAnimations,
  zIndexManager
};