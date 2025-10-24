import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, RotateCcw, Clock, FileCode } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Checkpoint {
  id: string;
  description: string;
  timestamp: string;
  gitCommit: string;
  files: string[];
}

interface CheckpointViewerProps {
  checkpoints: Checkpoint[];
  onRollback: (checkpointId: string) => void;
  isLoading?: boolean;
}

/**
 * Display list of checkpoints with rollback capability
 * Shows timestamp, description, affected files
 */
export function CheckpointViewer({ checkpoints, onRollback, isLoading }: CheckpointViewerProps) {
  if (checkpoints.length === 0) {
    return (
      <Card className="p-6 text-center" data-testid="card-no-checkpoints">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No checkpoints created yet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Checkpoints are automatically created during autonomous operations
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4" data-testid="card-checkpoints">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-teal-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Checkpoints
        </h3>
        <Badge variant="outline" className="ml-auto" data-testid="badge-checkpoint-count">
          {checkpoints.length}
        </Badge>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {checkpoints.map((checkpoint) => (
            <div
              key={checkpoint.id}
              className="p-3 rounded-lg border bg-white dark:bg-gray-800 hover:border-teal-500/50 transition-colors"
              data-testid={`checkpoint-${checkpoint.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {checkpoint.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span data-testid="text-timestamp">
                        {formatDistanceToNow(new Date(checkpoint.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCode className="h-3 w-3" />
                      <span data-testid="text-file-count">
                        {checkpoint.files.length} files
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <code className="text-xs text-gray-400 font-mono" data-testid="text-git-commit">
                      {checkpoint.gitCommit.substring(0, 7)}
                    </code>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRollback(checkpoint.id)}
                  disabled={isLoading}
                  data-testid={`button-rollback-${checkpoint.id}`}
                  className="shrink-0 border-teal-500/50 text-teal-500 hover:bg-teal-500/10"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Rollback
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
