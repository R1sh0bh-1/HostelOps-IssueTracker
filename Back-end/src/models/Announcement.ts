import mongoose, { Schema } from 'mongoose';

export interface AnnouncementDoc extends mongoose.Document {
  title: string;
  message: string;
  hostel: string;
  blocks: string[];
  createdBy: { id: string; name: string; email: string; role: string };
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<AnnouncementDoc>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    hostel: { type: String, required: true },
    blocks: { type: [String], required: true, default: [] },
    createdBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
    },
  },
  { timestamps: true }
);

announcementSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete (ret as any)._id;
    return ret;
  },
});

export const AnnouncementModel = mongoose.model<AnnouncementDoc>('Announcement', announcementSchema);

