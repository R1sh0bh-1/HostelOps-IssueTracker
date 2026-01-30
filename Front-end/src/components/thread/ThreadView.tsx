import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Ban,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useThread } from '@/hooks/useThread';
import { useToast } from '@/hooks/use-toast';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Issue } from '@/types/issue';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  issue: Issue;
  onClose?: () => void;
}

export function ThreadView({ issue, onClose }: ThreadViewProps) {
  const { toast } = useToast();
  const {
    thread,
    loading,
    error,
    isManagement,
    visibleComments,
    fetchThread,
    addComment,
    resolveThread,
    blockThread,
    unblockThread,
    blockComment,
    unblockComment,
  } = useThread(issue.id);

  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'resolve' | 'block' | 'unblock';
  }>({ open: false, action: 'resolve' });

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleAddComment = async (content: string) => {
    try {
      await addComment(content, replyingTo?.id);
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added to the discussion.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to post comment',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleResolve = async () => {
    try {
      await resolveThread();
      toast({
        title: 'Thread resolved',
        description: 'The discussion has been marked as resolved and is now locked.',
      });
    } catch (err) {
      toast({
        title: 'Failed to resolve thread',
        variant: 'destructive',
      });
    }
    setConfirmDialog({ open: false, action: 'resolve' });
  };

  const handleBlockThread = async () => {
    try {
      await blockThread();
      toast({
        title: 'Thread blocked',
        description: 'New comments are now disabled for this thread.',
      });
    } catch (err) {
      toast({
        title: 'Failed to block thread',
        variant: 'destructive',
      });
    }
    setConfirmDialog({ open: false, action: 'block' });
  };

  const handleUnblockThread = async () => {
    try {
      await unblockThread();
      toast({
        title: 'Thread unblocked',
        description: 'Comments are now enabled for this thread.',
      });
    } catch (err) {
      toast({
        title: 'Failed to unblock thread',
        variant: 'destructive',
      });
    }
    setConfirmDialog({ open: false, action: 'unblock' });
  };

  const handleBlockComment = async (commentId: string) => {
    try {
      await blockComment(commentId);
      toast({
        title: 'Comment blocked',
        description: 'The comment is now hidden from regular users.',
      });
    } catch (err) {
      toast({
        title: 'Failed to block comment',
        variant: 'destructive',
      });
    }
  };

  const handleUnblockComment = async (commentId: string) => {
    try {
      await unblockComment(commentId);
      toast({
        title: 'Comment unblocked',
        description: 'The comment is now visible to all users.',
      });
    } catch (err) {
      toast({
        title: 'Failed to unblock comment',
        variant: 'destructive',
      });
    }
  };

  const isThreadLocked = thread?.isResolved || thread?.isBlocked;
  const canComment = !isThreadLocked;

  if (loading) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading discussion...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-foreground font-medium">Failed to load discussion</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchThread}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Discussion
              <Badge variant="secondary" className="ml-1">
                {visibleComments.length} {visibleComments.length === 1 ? 'comment' : 'comments'}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {thread?.isResolved && (
                <Badge variant="default" className="bg-success text-success-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
              {thread?.isBlocked && !thread?.isResolved && (
                <Badge variant="destructive">
                  <Lock className="h-3 w-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>
          </div>

          {/* Management Actions */}
          {isManagement && thread && (
            <div className="flex flex-wrap gap-2 mt-3">
              {!thread.isResolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, action: 'resolve' })}
                  className="text-success border-success/50 hover:bg-success/10"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Resolve Thread
                </Button>
              )}

              {thread.isBlocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, action: 'unblock' })}
                >
                  <Unlock className="h-4 w-4 mr-1.5" />
                  Unblock Thread
                </Button>
              ) : !thread.isResolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDialog({ open: true, action: 'block' })}
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                >
                  <Ban className="h-4 w-4 mr-1.5" />
                  Block Thread
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          {/* Thread status message for non-management */}
          {isThreadLocked && !isManagement && (
            <div className={cn(
              'mb-4 p-3 rounded-lg text-sm',
              thread?.isResolved ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              {thread?.isResolved ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  This discussion has been resolved and is now read-only.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  This discussion has been locked by a moderator.
                </div>
              )}
            </div>
          )}

          {/* Comments List */}
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-1">
              <AnimatePresence>
                {visibleComments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center text-muted-foreground"
                  >
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet. Start the discussion!</p>
                  </motion.div>
                ) : (
                  visibleComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isManagement={isManagement}
                      isThreadLocked={!!isThreadLocked}
                      onReply={(id) => setReplyingTo({ id, userName: comment.userName })}
                      onBlock={handleBlockComment}
                      onUnblock={handleUnblockComment}
                      isReplyTarget={replyingTo?.id === comment.id}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Comment Form */}
          {canComment ? (
            <div className="mt-4 pt-4 border-t">
              <CommentForm
                onSubmit={handleAddComment}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t">
              <div className="text-center py-4 text-muted-foreground text-sm">
                {thread?.isResolved 
                  ? 'This thread has been resolved. No new comments allowed.'
                  : 'This thread has been blocked. No new comments allowed.'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'resolve' && 'Resolve this thread?'}
              {confirmDialog.action === 'block' && 'Block this thread?'}
              {confirmDialog.action === 'unblock' && 'Unblock this thread?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'resolve' && 
                'This will mark the thread as resolved and lock all replies. This action cannot be undone.'}
              {confirmDialog.action === 'block' && 
                'This will prevent all users from posting new comments. You can unblock it later.'}
              {confirmDialog.action === 'unblock' && 
                'This will allow users to post comments again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.action === 'resolve') handleResolve();
                else if (confirmDialog.action === 'block') handleBlockThread();
                else handleUnblockThread();
              }}
              className={cn(
                confirmDialog.action === 'resolve' && 'bg-success hover:bg-success/90',
                confirmDialog.action === 'block' && 'bg-destructive hover:bg-destructive/90'
              )}
            >
              {confirmDialog.action === 'resolve' && 'Resolve Thread'}
              {confirmDialog.action === 'block' && 'Block Thread'}
              {confirmDialog.action === 'unblock' && 'Unblock Thread'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
