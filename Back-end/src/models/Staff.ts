import mongoose, { Schema } from 'mongoose';

export type StaffSpecialty =
    | 'plumbing'
    | 'electrical'
    | 'internet'
    | 'cleanliness'
    | 'furniture'
    | 'security'
    | 'other';

export interface StaffDoc extends mongoose.Document {
    name: string;
    email: string;
    phone?: string;
    specialty: StaffSpecialty;
    hostel: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const staffSchema = new Schema<StaffDoc>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: false },
        specialty: {
            type: String,
            enum: ['plumbing', 'electrical', 'internet', 'cleanliness', 'furniture', 'security', 'other'],
            required: true,
        },
        hostel: { type: String, required: true },
        avatar: { type: String, required: false },
        isActive: { type: Boolean, required: true, default: true },
    },
    { timestamps: true }
);

staffSchema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete (ret as any)._id;
        return ret;
    },
});

export const StaffModel = mongoose.model<StaffDoc>('Staff', staffSchema);
