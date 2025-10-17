/**
 * CONSOLE TAB - Real-time Workflow Logs Viewer
 * Matches Replit's Console functionality
 */

import { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConsoleTab() {
  const [logs, setLogs] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial logs
    fetchLogs();

    // Poll for new logs every 2 seconds
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs/workflow');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
    log.toLowerCase().includes(filter.toLowerCase())
  );

  const getLogColor = (log: string) => {
    if (log.includes('ERROR') || log.includes('error')) return 'text-red-400';
    if (log.includes('WARN') || log.includes('warn')) return 'text-yellow-400';
    if (log.includes('SUCCESS') || log.includes('✓')) return 'text-green-400';
    return 'text-gray-300';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Console</h3>
          <span className="text-xs text-gray-400">({filteredLogs.length} logs)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="text-xs"
            data-testid="button-toggle-autoscroll"
          >
            {autoScroll ? '📜 Auto-scroll ON' : '📜 Auto-scroll OFF'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLogs}
            data-testid="button-download-logs"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            data-testid="button-clear-logs"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search/Filter */}
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search logs..."
            className="pl-10 bg-gray-800 border-gray-600 text-white"
            data-testid="input-search-logs"
          />
        </div>
      </div>

      {/* Logs Display */}
      <div className="flex-1 overflow-auto p-3 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs available. Run a workflow to see output here.
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`py-0.5 ${getLogColor(log)}`}
              data-testid={`log-line-${index}`}
            >
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 text-xs text-gray-400 flex items-center gap-2">
        <Filter className="w-3 h-3" />
        <span>Live console output from workflows</span>
      </div>
    </div>
  );
}
