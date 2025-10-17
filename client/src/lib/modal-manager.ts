// MT Ocean Modal Manager
// ESA LIFE CEO 61x21 - Centralized Modal State Management

import { create } from 'zustand';
import { ReactNode } from 'react';

export interface ModalConfig {
  id: string;
  component: ReactNode;
  props?: Record<string, any>;
  onClose?: () => void;
  priority?: number;
  preventClose?: boolean;
  className?: string;
  zIndex?: number;
}

interface ModalState {
  modals: ModalConfig[];
  activeModalId: string | null;
  isAnyModalOpen: boolean;
  openModal: (config: ModalConfig) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  closeTopModal: () => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;
  getModal: (id: string) => ModalConfig | undefined;
  isModalOpen: (id: string) => boolean;
  setActiveModal: (id: string | null) => void;
}

// Z-index management
const BASE_Z_INDEX = 1000;
const Z_INDEX_INCREMENT = 10;

// Create modal store
export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],
  activeModalId: null,
  isAnyModalOpen: false,

  openModal: (config) => {
    const id = config.id || `modal-${Date.now()}`;
    const modalConfig: ModalConfig = {
      ...config,
      id,
      zIndex: config.zIndex || BASE_Z_INDEX + (get().modals.length * Z_INDEX_INCREMENT)
    };

    set((state) => {
      const updatedModals = [...state.modals, modalConfig];
      return {
        modals: updatedModals.sort((a, b) => (b.priority || 0) - (a.priority || 0)),
        activeModalId: id,
        isAnyModalOpen: true
      };
    });

    // Manage body scroll
    if (get().modals.length === 0) {
      document.body.style.overflow = 'hidden';
    }

    return id;
  },

  closeModal: (id) => {
    const modal = get().getModal(id);
    if (modal?.preventClose) return;

    if (modal?.onClose) {
      modal.onClose();
    }

    set((state) => {
      const updatedModals = state.modals.filter(m => m.id !== id);
      const newActiveId = updatedModals.length > 0 
        ? updatedModals[updatedModals.length - 1].id 
        : null;

      return {
        modals: updatedModals,
        activeModalId: newActiveId,
        isAnyModalOpen: updatedModals.length > 0
      };
    });

    // Restore body scroll if no modals left
    if (get().modals.length === 0) {
      document.body.style.overflow = '';
    }
  },

  closeAllModals: () => {
    const modals = get().modals;
    
    // Call onClose for each modal
    modals.forEach(modal => {
      if (!modal.preventClose && modal.onClose) {
        modal.onClose();
      }
    });

    // Filter out modals that can't be closed
    const remainingModals = modals.filter(m => m.preventClose);

    set({
      modals: remainingModals,
      activeModalId: remainingModals.length > 0 ? remainingModals[0].id : null,
      isAnyModalOpen: remainingModals.length > 0
    });

    // Restore body scroll if no modals left
    if (remainingModals.length === 0) {
      document.body.style.overflow = '';
    }
  },

  closeTopModal: () => {
    const modals = get().modals;
    if (modals.length > 0) {
      const topModal = modals[modals.length - 1];
      get().closeModal(topModal.id);
    }
  },

  updateModal: (id, updates) => {
    set((state) => ({
      modals: state.modals.map(modal =>
        modal.id === id ? { ...modal, ...updates } : modal
      )
    }));
  },

  getModal: (id) => {
    return get().modals.find(m => m.id === id);
  },

  isModalOpen: (id) => {
    return get().modals.some(m => m.id === id);
  },

  setActiveModal: (id) => {
    set({ activeModalId: id });
  }
}));

// Modal Manager Class for advanced operations
export class ModalManager {
  private static instance: ModalManager;
  private modalQueue: ModalConfig[] = [];
  private isProcessingQueue = false;

  private constructor() {
    // Setup global keyboard listeners
    this.setupKeyboardHandlers();
  }

  static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  private setupKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const store = useModalStore.getState();
        if (store.isAnyModalOpen) {
          store.closeTopModal();
        }
      }
    });
  }

  // Queue a modal to be shown
  queueModal(config: ModalConfig) {
    this.modalQueue.push(config);
    this.processQueue();
  }

  // Process queued modals
  private async processQueue() {
    if (this.isProcessingQueue || this.modalQueue.length === 0) return;

    this.isProcessingQueue = true;
    const store = useModalStore.getState();

    while (this.modalQueue.length > 0 && !store.isAnyModalOpen) {
      const config = this.modalQueue.shift();
      if (config) {
        store.openModal(config);
        // Wait for modal to close before showing next
        await this.waitForModalClose(config.id);
      }
    }

    this.isProcessingQueue = false;
  }

  // Wait for a specific modal to close
  private waitForModalClose(id: string): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const store = useModalStore.getState();
        if (!store.isModalOpen(id)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  // Show confirmation dialog
  async confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger';
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const store = useModalStore.getState();
      
      const modalId = store.openModal({
        id: `confirm-${Date.now()}`,
        component: null, // Will be replaced with actual component
        props: {
          ...options,
          onConfirm: () => {
            store.closeModal(modalId);
            resolve(true);
          },
          onCancel: () => {
            store.closeModal(modalId);
            resolve(false);
          }
        },
        priority: 100
      });
    });
  }

  // Show alert
  alert(options: {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }) {
    const store = useModalStore.getState();
    
    return store.openModal({
      id: `alert-${Date.now()}`,
      component: null, // Will be replaced with actual component
      props: options,
      priority: 90
    });
  }

  // Manage focus trap
  setupFocusTrap(modalElement: HTMLElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
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

    modalElement.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      modalElement.removeEventListener('keydown', handleTabKey);
    };
  }
}

// Export singleton instance
export const modalManager = ModalManager.getInstance();

// Utility functions
export const modalUtils = {
  // Generate unique modal ID
  generateId: (prefix = 'modal') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Check if any modal is open
  isAnyModalOpen: () => useModalStore.getState().isAnyModalOpen,

  // Get active modal
  getActiveModal: () => {
    const state = useModalStore.getState();
    return state.modals.find(m => m.id === state.activeModalId);
  },

  // Get all open modals
  getAllModals: () => useModalStore.getState().modals,

  // Clear all modals (force)
  forceCloseAll: () => {
    const store = useModalStore.getState();
    store.modals.forEach(modal => {
      if (modal.onClose) modal.onClose();
    });
    store.modals = [];
    store.activeModalId = null;
    store.isAnyModalOpen = false;
    document.body.style.overflow = '';
  }
};

export default modalManager;