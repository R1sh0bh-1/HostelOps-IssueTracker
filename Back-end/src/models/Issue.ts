import mongoose, { Schema } from 'mongoose';

export type IssueCategory =
  | 'plumbing'
  | 'electrical'
  | 'internet'
  | 'cleanliness'
  | 'furniture'
  | 'security'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'emergency';
export type IssueStatus = 'reported' | 'assigned' | 'in-progress' | 'resolved' | 'closed';

export interface IssueDoc extends mongoose.Document {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: { hostel: string; block: string; room: string };
  reportedBy: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; phone?: string };
  adminRemark?: {
    content: string;
    addedBy: { id: string; name: string };
    addedAt: Date;
  };
  resolutionProofs?: { id: string; name: string; type: 'image' | 'video' | 'pdf'; url: string; thumbnail?: string; uploadedAt: Date }[];
  resolutionRemark?: string;
  resolvedBy?: { id: string; name: string };
  attachments: { id: string; name: string; type: 'image' | 'video' | 'pdf'; url: string; thumbnail?: string }[];
  resolvedAt?: Date;
  mergedInto?: string; // ID of the primary issue if this issue was merged
  mergedIssues?: string[]; // Array of issue IDs that were merged into this one
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'pdf'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: false },
    uploadedAt: { type: Date, required: false },
  },
  { _id: false }
);

const issueSchema = new Schema<IssueDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'internet', 'cleanliness', 'furniture', 'security', 'other'],
      required: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], required: true },
    status: { type: String, enum: ['reported', 'assigned', 'in-progress', 'resolved', 'closed'], required: true, default: 'reported' },
    location: {
      hostel: { type: String, required: true },
      block: { type: String, required: true },
      room: { type: String, required: true },
    },
    reportedBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    assignedTo: {
      id: { type: String, required: false },
      name: { type: String, required: false },
      phone: { type: String, required: false },
    },
    adminRemark: {
      content: { type: String, required: false },
      addedBy: {
        id: { type: String, required: false },
        name: { type: String, required: false },
      },
      addedAt: { type: Date, required: false },
    },
    resolutionProofs: { type: [attachmentSchema], required: false, default: [] },
    resolutionRemark: { type: String, required: false },
    resolvedBy: {
      id: { type: String, required: false },
      name: { type: String, required: false },
    },
    attachments: { type: [attachmentSchema], required: true, default: [] },
    resolvedAt: { type: Date, required: false },
    mergedInto: { type: String, required: false },
    mergedIssues: { type: [String], required: false, default: [] },
  },
  { timestamps: true }
);

issueSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete (ret as any)._id;
    return ret;
  },
});

export const IssueModel = mongoose.model<IssueDoc>('Issue', issueSchema);

