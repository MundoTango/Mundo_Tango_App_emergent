import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showLabel?: boolean;
  label?: string;
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  readonly = false,
  showLabel = false,
  label,
  ...props
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2" {...props}>
      {showLabel && label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[140px]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            disabled={readonly}
            className={cn(
              "transition-all",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
            data-testid={`star-${value}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-300",
                value <= rating
                  ? "fill-gradient-ocean text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
              )}
              style={value <= rating ? {
                fill: "url(#ocean-gradient)"
              } : undefined}
            />
            {value === 1 && value <= rating && (
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(20, 184, 166)" />
                    <stop offset="50%" stopColor="rgb(6, 182, 212)" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </button>
        ))}
        {showLabel && (
          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
