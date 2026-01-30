import { Category, Priority, Status } from '@/utils/constants';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  adminRemark?: {
    content: string;
    addedBy: { id: string; name: string };
    addedAt: Date;
  };
  resolutionProofs?: Attachment[];
  resolutionRemark?: string;
  resolvedBy?: { id: string; name: string };
  location: {
    hostel: string;
    block: string;
    room: string;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    phone?: string;
  };
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  mergedInto?: string; // ID of the primary issue if this issue was merged
  mergedIssues?: string[]; // Array of issue IDs that were merged into this one
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf';
  url: string;
  thumbnail?: string;
  uploadedAt?: Date;
}

export interface IssueFormData {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  attachments: File[];
}

export interface SimilarIssue {
  issue: Issue;
  similarityScore: number;
  matchReasons: string[];
}

export interface MergeRequest {
  duplicateIds: string[];
}
