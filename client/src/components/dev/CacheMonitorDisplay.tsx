interface CacheMonitorDisplayProps {
  className?: string;
}

export function CacheMonitorDisplay({ className }: CacheMonitorDisplayProps) {
  return (
    <div className={className}>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Cache Monitor
      </div>
    </div>
  );
}

export default CacheMonitorDisplay;
