// Thread and Comment types for discussion system

export interface ThreadComment {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: 'student' | 'warden' | 'management' | 'maintenance';
  content: string;
  parentCommentId?: string;
  isBlocked: boolean;
  blockedBy?: string;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  replies?: ThreadComment[];
}

export interface DiscussionThread {
  id: string;
  issueId: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  isBlocked: boolean;
  blockedBy?: string;
  blockedAt?: Date;
  comments: ThreadComment[];
  createdAt: Date;
  updatedAt: Date;
}

export type ThreadStatus = 'open' | 'resolved' | 'blocked';
