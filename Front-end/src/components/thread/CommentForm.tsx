import { useState } from 'react';
import { Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  replyingTo?: { id: string; userName: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  replyingTo,
  onCancelReply,
  disabled,
  placeholder = 'Write a comment...',
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      onCancelReply?.();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {replyingTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
          <span>Replying to <strong>{replyingTo.userName}</strong></span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 ml-auto"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className={cn(
            'min-h-[80px] resize-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Press ⌘/Ctrl + Enter to send
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting || disabled}
        >
          <Send className="h-4 w-4 mr-1.5" />
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
