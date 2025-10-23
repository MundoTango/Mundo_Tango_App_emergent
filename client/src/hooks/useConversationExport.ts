/**
 * TRACK E: Conversation Export Hook
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #128 (Hooks)
 * 
 * Export state management and API calls
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type ExportFormat = 'pdf' | 'markdown' | 'json' | 'txt';

export interface ExportOptions {
  projectId: number;
  format: ExportFormat;
  includeMessages: boolean;
  includeVoice: boolean;
  includeMetadata: boolean;
  includeTimestamps: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

export function useConversationExport(isOpen: boolean) {
  const [options, setOptions] = useState<Partial<ExportOptions>>({
    format: 'markdown',
    includeMessages: true,
    includeVoice: true,
    includeMetadata: false,
    includeTimestamps: true,
  });

  // Export mutation
  const exportMutation = useMutation<ExportResult, Error, ExportOptions>({
    mutationFn: async (opts) => {
      const response = await apiRequest('/api/conversations/export', {
        method: 'POST',
        body: JSON.stringify(opts),
      });
      const data = await response.json();
      return data as ExportResult;
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `conversation-export.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });

  const updateOption = useCallback(<K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const startExport = useCallback((projectId: number) => {
    if (!options.format) return;

    exportMutation.mutate({
      projectId,
      format: options.format,
      includeMessages: options.includeMessages ?? true,
      includeVoice: options.includeVoice ?? true,
      includeMetadata: options.includeMetadata ?? false,
      includeTimestamps: options.includeTimestamps ?? true,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
    });
  }, [options, exportMutation]);

  return {
    options,
    updateOption,
    startExport,
    isExporting: exportMutation.isPending,
    error: exportMutation.error,
    isSuccess: exportMutation.isSuccess,
  };
}
