import mongoose, { Schema } from 'mongoose';

export type LostFoundStatus = 'pending' | 'claimed' | 'rejected';

export interface LostFoundItemDoc extends mongoose.Document {
  kind: 'lost' | 'found';
  name: string;
  description?: string;
  foundLocation: string;
  status: LostFoundStatus;
  reportedBy: { id: string; name: string; email: string };
  photo?: { id: string; name: string; type: 'image' | 'video' | 'pdf'; url: string; thumbnail?: string };
  claimRequest?: { userId: string; userName: string; userEmail: string; userContact?: string; userRoom?: string; requestedAt: Date; note?: string };
  claimedBy?: { id: string; name: string; email: string; claimedAt: Date };
  isResolved: boolean;
  resolvedBy?: { id: string; name: string; role: string };
  resolvedAt?: Date;
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
  },
  { _id: false }
);

const lostFoundItemSchema = new Schema<LostFoundItemDoc>(
  {
    kind: { type: String, enum: ['lost', 'found'], required: true, default: 'found' },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    foundLocation: { type: String, required: true },
    status: { type: String, enum: ['pending', 'claimed', 'rejected'], required: true, default: 'pending' },
    reportedBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    photo: { type: attachmentSchema, required: false },
    claimRequest: {
      userId: { type: String, required: false },
      userName: { type: String, required: false },
      userEmail: { type: String, required: false },
      userContact: { type: String, required: false },
      userRoom: { type: String, required: false },
      requestedAt: { type: Date, required: false },
      note: { type: String, required: false },
    },
    claimedBy: {
      id: { type: String, required: false },
      name: { type: String, required: false },
      email: { type: String, required: false },
      claimedAt: { type: Date, required: false },
    },
    isResolved: { type: Boolean, required: true, default: false },
    resolvedBy: {
      id: { type: String, required: false },
      name: { type: String, required: false },
      role: { type: String, required: false },
    },
    resolvedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

lostFoundItemSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete (ret as any)._id;
    return ret;
  },
});

export const LostFoundItemModel = mongoose.model<LostFoundItemDoc>('LostFoundItem', lostFoundItemSchema);

