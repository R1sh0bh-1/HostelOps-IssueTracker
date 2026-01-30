import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackStarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function FeedbackStarRating({ rating, onRatingChange, readonly = false, size = 'md' }: FeedbackStarRatingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleClick(value)}
                    disabled={readonly}
                    className={cn(
                        'transition-all',
                        !readonly && 'hover:scale-110 cursor-pointer',
                        readonly && 'cursor-default'
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            value <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-none text-muted-foreground'
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
