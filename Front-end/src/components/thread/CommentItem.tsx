import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Reply, 
  MoreVertical, 
  Ban, 
  Eye, 
  Shield,
  User
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThreadComment } from '@/types/thread';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: ThreadComment;
  isManagement: boolean;
  isThreadLocked: boolean;
  onReply?: (commentId: string) => void;
  onBlock?: (commentId: string) => void;
  onUnblock?: (commentId: string) => void;
  isReplyTarget?: boolean;
}

export function CommentItem({
  comment,
  isManagement,
  isThreadLocked,
  onReply,
  onBlock,
  onUnblock,
  isReplyTarget,
}: CommentItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'management':
        return <Badge variant="default" className="text-[10px] px-1.5 py-0">Admin</Badge>;
      case 'warden':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Warden</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Staff</Badge>;
      default:
        return null;
    }
  };

  const isBlockedComment = comment.isBlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative flex gap-3 py-3',
        isReplyTarget && 'bg-primary/5 -mx-3 px-3 rounded-lg',
        isBlockedComment && isManagement && 'opacity-60 bg-destructive/5 -mx-3 px-3 rounded-lg'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback className={cn(
          'text-xs font-medium',
          comment.userRole === 'management' && 'bg-primary text-primary-foreground',
          comment.userRole === 'warden' && 'bg-secondary text-secondary-foreground',
          comment.userRole === 'maintenance' && 'bg-accent text-accent-foreground',
        )}>
          {getInitials(comment.userName)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-foreground">
            {comment.userName}
          </span>
          {getRoleBadge(comment.userRole)}
          <span className="text-xs text-muted-foreground">
            {format(new Date(comment.createdAt), 'MMM d, yyyy · h:mm a')}
          </span>
          {isBlockedComment && isManagement && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              <Ban className="h-2.5 w-2.5 mr-1" />
              Blocked
            </Badge>
          )}
        </div>

        {isBlockedComment && isManagement ? (
          <div className="mt-1.5 text-sm text-muted-foreground italic">
            [This comment has been blocked by moderator]
            <p className="mt-1 text-foreground/50 line-through">{comment.content}</p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Reply indicator */}
        {comment.parentCommentId && (
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <Reply className="h-3 w-3" />
            Replying to a comment
          </div>
        )}
      </div>

      {/* Actions */}
      {!isThreadLocked && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {!isBlockedComment && onReply && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          )}

          {isManagement && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isBlockedComment ? (
                  <DropdownMenuItem onClick={() => onUnblock?.(comment.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Unblock Comment
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => onBlock?.(comment.id)}
                    className="text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Block Comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </motion.div>
  );
}
