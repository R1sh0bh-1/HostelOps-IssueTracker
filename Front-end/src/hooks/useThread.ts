import { useState, useCallback } from 'react';
import { DiscussionThread, ThreadComment } from '@/types/thread';
import { threadService } from '@/services/threadService';
import { useAuth } from './useAuth';

export function useThread(issueId: string) {
  const { user } = useAuth();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManagement = user?.role === 'management' || user?.role === 'warden';

  const fetchThread = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let existingThread = await threadService.getThreadByIssueId(issueId);
      if (!existingThread) {
        existingThread = await threadService.createThread(issueId);
      }
      setThread(existingThread);
    } catch (err) {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!thread || !user) return;
    if (thread.isResolved || thread.isBlocked) {
      throw new Error('Cannot add comment to this thread');
    }

    try {
      const newComment = await threadService.addComment(
        thread.id,
        user.id,
        user.name,
        user.role,
        content,
        parentCommentId
      );
      setThread(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment],
        updatedAt: new Date(),
      } : null);
      return newComment;
    } catch (err) {
      throw err;
    }
  };

  const resolveThread = async () => {
    if (!thread || !user || !isManagement) return;
    try {
      const updated = await threadService.resolveThread(thread.id, user.id);
      setThread(updated);
    } catch (err) {
      throw err;
    }
  };

  const blockThread = async () => {
    if (!thread || !user || !isManagement) return;
    try {
      const updated = await threadService.blockThread(thread.id, user.id);
      setThread(updated);
    } catch (err) {
      throw err;
    }
  };

  const unblockThread = async () => {
    if (!thread || !user || !isManagement) return;
    try {
      const updated = await threadService.unblockThread(thread.id);
      setThread(updated);
    } catch (err) {
      throw err;
    }
  };

  const blockComment = async (commentId: string) => {
    if (!thread || !user || !isManagement) return;
    try {
      const updatedComment = await threadService.blockComment(thread.id, commentId, user.id);
      setThread(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c => c.id === commentId ? updatedComment : c),
      } : null);
    } catch (err) {
      throw err;
    }
  };

  const unblockComment = async (commentId: string) => {
    if (!thread || !user || !isManagement) return;
    try {
      const updatedComment = await threadService.unblockComment(thread.id, commentId);
      setThread(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c => c.id === commentId ? updatedComment : c),
      } : null);
    } catch (err) {
      throw err;
    }
  };

  // Filter comments for non-management users (hide blocked comments)
  const visibleComments = thread?.comments.filter(c => {
    if (isManagement) return true;
    return !c.isBlocked;
  }) || [];

  return {
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
  };
}
