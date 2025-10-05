import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
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
    <div className="flex items-center gap-2">
      {showLabel && label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px]">
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
                "transition-colors",
                value <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600"
              )}
            />
          </button>
        ))}
        {showLabel && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
