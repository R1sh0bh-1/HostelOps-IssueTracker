import mongoose, { Schema } from 'mongoose';

export type ThreadUserRole = 'student' | 'warden' | 'management' | 'maintenance';

export interface ThreadCommentSubdoc {
  // Mongoose subdoc internal id
  _id?: unknown;
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: ThreadUserRole;
  content: string;
  parentCommentId?: string;
  isBlocked: boolean;
  blockedBy?: string;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreadDoc extends mongoose.Document {
  issueId: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  isBlocked: boolean;
  blockedBy?: string;
  blockedAt?: Date;
  comments: ThreadCommentSubdoc[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, required: false },
    userRole: { type: String, enum: ['student', 'warden', 'management', 'maintenance'], required: true },
    content: { type: String, required: true },
    parentCommentId: { type: String, required: false },
    isBlocked: { type: Boolean, required: true, default: false },
    blockedBy: { type: String, required: false },
    blockedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

commentSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as any;
    r.id = String(r._id);
    delete r._id;
    // threadId is injected from parent thread in Thread transform
    return r;
  },
});

const threadSchema = new Schema<ThreadDoc>(
  {
    issueId: { type: String, required: true, index: true, unique: true },
    isResolved: { type: Boolean, required: true, default: false },
    resolvedBy: { type: String, required: false },
    resolvedAt: { type: Date, required: false },
    isBlocked: { type: Boolean, required: true, default: false },
    blockedBy: { type: String, required: false },
    blockedAt: { type: Date, required: false },
    comments: { type: [commentSchema], required: true, default: [] },
  },
  { timestamps: true }
);

threadSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as any;
    const threadId = String(r._id);
    r.id = threadId;
    delete r._id;
    if (Array.isArray(r.comments)) {
      r.comments = r.comments.map((c: any) => ({
        ...c,
        threadId,
      }));
    }
    return r;
  },
});

export const ThreadModel = mongoose.model<ThreadDoc>('Thread', threadSchema);

