/**
 * TRACK E: Conversation Export Modal
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #126 (UI)
 * 
 * Export conversations in multiple formats
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FileText,
  FileJson,
  FileCode,
  Download,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useConversationExport, type ExportFormat } from '@/hooks/useConversationExport';

interface ConversationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
}

const FORMAT_OPTIONS: Array<{
  value: ExportFormat;
  label: string;
  description: string;
  icon: any;
}> = [
  {
    value: 'markdown',
    label: 'Markdown',
    description: 'Human-readable format for documentation',
    icon: FileText,
  },
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Professional document format',
    icon: FileText,
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data for developers',
    icon: FileJson,
  },
  {
    value: 'txt',
    label: 'Plain Text',
    description: 'Simple text file',
    icon: FileCode,
  },
];

export function ConversationExportModal({
  isOpen,
  onClose,
  projectId,
  projectName,
}: ConversationExportModalProps) {
  const {
    options,
    updateOption,
    startExport,
    isExporting,
    isSuccess,
  } = useConversationExport(isOpen);

  const handleExport = () => {
    startExport(projectId);
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Conversation
          </DialogTitle>
          <DialogDescription>
            Export "{projectName}" to your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => updateOption('format', value as ExportFormat)}
            >
              {FORMAT_OPTIONS.map((format) => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.value}
                    className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <RadioGroupItem
                      value={format.value}
                      id={`format-${format.value}`}
                      data-testid={`radio-format-${format.value}`}
                    />
                    <Label
                      htmlFor={`format-${format.value}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-gray-500">
                            {format.description}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Content options */}
          <div className="space-y-3">
            <Label>Include Content</Label>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Text Messages</div>
                <div className="text-xs text-gray-500">Include chat messages</div>
              </div>
              <Switch
                checked={options.includeMessages}
                onCheckedChange={(checked) => updateOption('includeMessages', checked)}
                data-testid="switch-include-messages"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Voice Conversations</div>
                <div className="text-xs text-gray-500">Include voice transcripts</div>
              </div>
              <Switch
                checked={options.includeVoice}
                onCheckedChange={(checked) => updateOption('includeVoice', checked)}
                data-testid="switch-include-voice"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Timestamps</div>
                <div className="text-xs text-gray-500">Show message times</div>
              </div>
              <Switch
                checked={options.includeTimestamps}
                onCheckedChange={(checked) => updateOption('includeTimestamps', checked)}
                data-testid="switch-include-timestamps"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Metadata</div>
                <div className="text-xs text-gray-500">Models, tokens, costs</div>
              </div>
              <Switch
                checked={options.includeMetadata}
                onCheckedChange={(checked) => updateOption('includeMetadata', checked)}
                data-testid="switch-include-metadata"
              />
            </div>
          </div>

          {/* Export button */}
          <div className="pt-2">
            {isSuccess ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleClose}
                data-testid="button-export-success"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                Export Complete!
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleExport}
                disabled={isExporting || !options.format}
                data-testid="button-start-export"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export as {options.format?.toUpperCase()}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
