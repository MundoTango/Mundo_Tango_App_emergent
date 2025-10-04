interface UnifiedMapLegendProps {
  items: Array<{
    color: string;
    label: string;
    count?: number;
  }>;
  title?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

export default function UnifiedMapLegend({ 
  items, 
  title = 'Map Legend',
  position = 'bottom-right' 
}: UnifiedMapLegendProps) {
  if (items.length === 0) return null;

  return (
    <div 
      className={`absolute ${positionClasses[position]} bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000] min-w-[150px]`}
      data-testid="map-legend"
    >
      <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
        {title}
      </h4>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
          >
            <div 
              className={`w-4 h-4 bg-gradient-to-r from-${item.color} to-cyan-500 rounded-full flex-shrink-0`}
            />
            <span className="flex-1">
              {item.label}
              {item.count !== undefined && (
                <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                  ({item.count})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
