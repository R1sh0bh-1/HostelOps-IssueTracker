import { DiscussionThread, ThreadComment } from '@/types/thread';
import { apiFetch } from '@/utils/apiClient';

function mapComment(raw: any, threadId: string): ThreadComment {
  return {
    ...raw,
    threadId,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    blockedAt: raw.blockedAt ? new Date(raw.blockedAt) : undefined,
  };
}

function mapThread(raw: any): DiscussionThread {
  const threadId = raw.id;
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    resolvedAt: raw.resolvedAt ? new Date(raw.resolvedAt) : undefined,
    blockedAt: raw.blockedAt ? new Date(raw.blockedAt) : undefined,
    comments: Array.isArray(raw.comments) ? raw.comments.map((c: any) => mapComment(c, threadId)) : [],
  };
}

export const threadService = {
  // Get thread by issue ID
  async getThreadByIssueId(issueId: string): Promise<DiscussionThread | null> {
    const data = await apiFetch<any | null>(`/api/threads/issue/${issueId}`);
    return data ? mapThread(data) : null;
  },

  // Get all threads
  async getAllThreads(): Promise<DiscussionThread[]> {
    const data = await apiFetch<any[]>('/api/threads');
    return data.map(mapThread);
  },

  // Create a new thread for an issue
  async createThread(issueId: string): Promise<DiscussionThread> {
    const created = await apiFetch<any>('/api/threads', {
      method: 'POST',
      body: JSON.stringify({ issueId }),
    });
    return mapThread(created);
  },

  // Add comment to thread
  async addComment(
    threadId: string,
    userId: string,
    userName: string,
    userRole: 'student' | 'warden' | 'management' | 'maintenance',
    content: string,
    parentCommentId?: string
  ): Promise<ThreadComment> {
    const created = await apiFetch<any>(`/api/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userId, userName, userRole, content, parentCommentId }),
    });
    return mapComment(created, threadId);
  },

  // Resolve thread (management only)
  async resolveThread(threadId: string, resolvedBy: string): Promise<DiscussionThread> {
    const updated = await apiFetch<any>(`/api/threads/${threadId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolvedBy }),
    });
    return mapThread(updated);
  },

  // Block thread (management only)
  async blockThread(threadId: string, blockedBy: string): Promise<DiscussionThread> {
    const updated = await apiFetch<any>(`/api/threads/${threadId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blockedBy }),
    });
    return mapThread(updated);
  },

  // Unblock thread (management only)
  async unblockThread(threadId: string): Promise<DiscussionThread> {
    const updated = await apiFetch<any>(`/api/threads/${threadId}/unblock`, {
      method: 'PATCH',
    });
    return mapThread(updated);
  },

  // Block comment (management only)
  async blockComment(threadId: string, commentId: string, blockedBy: string): Promise<ThreadComment> {
    const updated = await apiFetch<any>(`/api/threads/${threadId}/comments/${commentId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blockedBy }),
    });
    return mapComment(updated, threadId);
  },

  // Unblock comment (management only)
  async unblockComment(threadId: string, commentId: string): Promise<ThreadComment> {
    const updated = await apiFetch<any>(`/api/threads/${threadId}/comments/${commentId}/unblock`, {
      method: 'PATCH',
    });
    return mapComment(updated, threadId);
  },
};
