export type LostFoundStatus = 'pending' | 'claimed' | 'rejected';

export interface LostFoundItem {
  id: string;
  kind?: 'lost' | 'found';
  name: string;
  description?: string;
  foundLocation: string;
  status: LostFoundStatus;
  reportedBy: { id: string; name: string; email: string };
  photo?: { id: string; name: string; type: 'image' | 'video' | 'pdf'; url: string; thumbnail?: string };
  claimRequest?: { userId: string; userName: string; userEmail: string; userContact?: string; userRoom?: string; requestedAt: string; note?: string };
  claimedBy?: { id: string; name: string; email: string; claimedAt: string };
  isResolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: { id: string; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

