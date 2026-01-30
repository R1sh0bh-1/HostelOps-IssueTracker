import mongoose, { Schema } from 'mongoose';

export type FeedbackCategory =
    | 'hygiene'
    | 'mess_food'
    | 'washrooms'
    | 'rooms'
    | 'security'
    | 'staff_behavior';

export interface FeedbackDoc extends mongoose.Document {
    studentId: string;
    studentName: string;
    studentEmail: string;
    category: FeedbackCategory;
    rating: number; // 1-5
    comment?: string;
    hostel: string;
    submittedAt: Date;
    month: number; // 1-12
    year: number;
}

const feedbackSchema = new Schema<FeedbackDoc>(
    {
        studentId: { type: String, required: true },
        studentName: { type: String, required: true },
        studentEmail: { type: String, required: true },
        category: {
            type: String,
            enum: ['hygiene', 'mess_food', 'washrooms', 'rooms', 'security', 'staff_behavior'],
            required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: false },
        hostel: { type: String, required: true },
        submittedAt: { type: Date, required: true, default: () => new Date() },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
    },
    { timestamps: true }
);

// Compound index to enforce one feedback per category per month per student
feedbackSchema.index({ studentId: 1, category: 1, month: 1, year: 1 }, { unique: true });

feedbackSchema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete (ret as any)._id;
        return ret;
    },
});

export const FeedbackModel = mongoose.model<FeedbackDoc>('Feedback', feedbackSchema);
