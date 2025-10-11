import { useState } from 'react';
import { FileCode, ExternalLink, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ESA Agent #17: Code Link Input Component
// File path + line range input with validation and VSCode integration

interface CodeLinkInputProps {
  filePath?: string;
  lineRange?: string;
  onFileChange: (path: string) => void;
  onLineChange: (range: string) => void;
  autoValidate?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export function CodeLinkInput({
  filePath = '',
  lineRange = '',
  onFileChange,
  onLineChange,
  autoValidate = true,
  disabled = false,
  'data-testid': testId = 'input-code-link',
}: CodeLinkInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Validate file path format
  const validateFilePath = (path: string): boolean => {
    if (!path) return false;
    
    // Check if path looks valid (contains at least one / and ends with extension)
    const hasValidStructure = path.includes('/') && /\.(tsx?|jsx?|css|py|rs|go)$/i.test(path);
    
    // Common starting patterns
    const hasValidStart = path.startsWith('client/') || 
                         path.startsWith('server/') || 
                         path.startsWith('shared/') ||
                         path.startsWith('src/');
    
    return hasValidStructure && hasValidStart;
  };

  // Validate line range format (e.g., "49-54" or "120")
  const validateLineRange = (range: string): boolean => {
    if (!range) return true; // Optional
    
    // Single line: "120"
    if (/^\d+$/.test(range)) return true;
    
    // Range: "49-54"
    if (/^\d+-\d+$/.test(range)) {
      const [start, end] = range.split('-').map(Number);
      return start < end;
    }
    
    return false;
  };

  const handleFilePathChange = (path: string) => {
    onFileChange(path);
    
    if (autoValidate && path) {
      setIsValidating(true);
      const valid = validateFilePath(path);
      setTimeout(() => {
        setIsValid(valid);
        setIsValidating(false);
      }, 300);
    } else {
      setIsValid(null);
    }
  };

  const handleOpenInEditor = () => {
    if (!filePath) return;
    
    // Construct VSCode URL
    // Format: vscode://file/{absolutePath}:{line}:{column}
    // For Replit, we use the workspace path
    const workspacePath = '/home/runner/workspace';
    const absolutePath = `${workspacePath}/${filePath}`;
    
    let url = `vscode://file/${absolutePath}`;
    
    if (lineRange) {
      const startLine = lineRange.includes('-') 
        ? lineRange.split('-')[0] 
        : lineRange;
      url += `:${startLine}:1`;
    }
    
    // Open in new tab (VSCode protocol handler will intercept)
    window.open(url, '_blank');
  };

  const isLineRangeValid = validateLineRange(lineRange);

  return (
    <div className="space-y-3" data-testid={testId}>
      {/* File Path Input */}
      <div className="space-y-2">
        <Label htmlFor="code-file-path">
          <FileCode className="inline h-4 w-4 mr-1" />
          Code File Path
        </Label>
        <div className="relative">
          <Input
            id="code-file-path"
            value={filePath}
            onChange={(e) => handleFilePathChange(e.target.value)}
            placeholder="client/src/pages/home.tsx"
            disabled={disabled}
            className={cn(
              'font-mono text-sm pr-8',
              isValid === true && 'border-green-500',
              isValid === false && 'border-red-500'
            )}
            data-testid="input-code-file-path"
          />
          {isValidating && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-500" />
            </div>
          )}
          {!isValidating && isValid === true && (
            <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {!isValidating && isValid === false && (
            <X className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        {isValid === false && (
          <p className="text-xs text-red-500">
            Please enter a valid file path (e.g., client/src/pages/home.tsx)
          </p>
        )}
      </div>

      {/* Line Range Input */}
      <div className="space-y-2">
        <Label htmlFor="code-line-range">
          Line Range <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="code-line-range"
          value={lineRange}
          onChange={(e) => onLineChange(e.target.value)}
          placeholder="49-54 or 120"
          disabled={disabled}
          className={cn(
            'font-mono text-sm',
            !isLineRangeValid && lineRange && 'border-red-500'
          )}
          data-testid="input-code-line-range"
        />
        {!isLineRangeValid && lineRange && (
          <p className="text-xs text-red-500">
            Invalid format. Use "49-54" for range or "120" for single line
          </p>
        )}
      </div>

      {/* Preview & Open Button */}
      {filePath && isValid && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <FileCode className="h-4 w-4 text-cyan-500" />
          <code className="flex-1 text-sm">
            {filePath}
            {lineRange && (
              <span className="text-cyan-500">:{lineRange}</span>
            )}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleOpenInEditor}
            disabled={disabled}
            data-testid="button-open-code"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Specify the exact file and lines where this task's work is located. 
        Click "Open" to jump directly to the code in your editor.
      </p>
    </div>
  );
}

// Readonly variant for displaying code links
interface CodeLinkDisplayProps {
  filePath: string;
  lineRange?: string;
  'data-testid'?: string;
}

export function CodeLinkDisplay({
  filePath,
  lineRange,
  'data-testid': testId = 'code-link-display',
}: CodeLinkDisplayProps) {
  const handleOpen = () => {
    const workspacePath = '/home/runner/workspace';
    const absolutePath = `${workspacePath}/${filePath}`;
    
    let url = `vscode://file/${absolutePath}`;
    
    if (lineRange) {
      const startLine = lineRange.includes('-') 
        ? lineRange.split('-')[0] 
        : lineRange;
      url += `:${startLine}:1`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleOpen}
      className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-left transition-colors hover:bg-muted/50"
      data-testid={testId}
    >
      <FileCode className="h-4 w-4 text-cyan-500" />
      <code className="flex-1 text-sm">
        {filePath}
        {lineRange && (
          <span className="text-cyan-500">:{lineRange}</span>
        )}
      </code>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
