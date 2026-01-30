import { z } from 'zod';
import { FeedbackModel } from '../models/Feedback';
import { HttpError } from '../utils/httpError';

const submitFeedbackSchema = z.object({
    category: z.enum(['hygiene', 'mess_food', 'washrooms', 'rooms', 'security', 'staff_behavior']),
    rating: z.number().min(1).max(5),
    comment: z.string().trim().optional(),
});

export async function submitFeedback(req: any, res: any) {
    const { category, rating, comment } = submitFeedbackSchema.parse(req.body);

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Check if student already submitted feedback for this category this month
    const existing = await FeedbackModel.findOne({
        studentId: req.user.id,
        category,
        month,
        year,
    });

    if (existing) {
        throw new HttpError(
            400,
            `You have already submitted feedback for ${category.replace('_', ' ')} this month. Please try again next month.`
        );
    }

    const feedback = await FeedbackModel.create({
        studentId: req.user.id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        category,
        rating,
        comment: comment?.trim(),
        hostel: req.user.hostel ?? 'Unknown',
        submittedAt: now,
        month,
        year,
    });

    res.status(201).json(feedback.toJSON());
}

export async function getMyFeedback(req: any, res: any) {
    const feedback = await FeedbackModel.find({ studentId: req.user.id }).sort({ submittedAt: -1 });
    res.json(feedback.map(f => f.toJSON()));
}

export async function getAnalytics(req: any, res: any) {
    const { hostel, startDate, endDate } = req.query;

    const filter: any = {};
    if (hostel && hostel !== 'all') {
        filter.hostel = hostel;
    }
    if (startDate || endDate) {
        filter.submittedAt = {};
        if (startDate) filter.submittedAt.$gte = new Date(startDate as string);
        if (endDate) filter.submittedAt.$lte = new Date(endDate as string);
    }

    // Get average ratings by category
    const categoryAverages = await FeedbackModel.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$category',
                averageRating: { $avg: '$rating' },
                totalFeedback: { $sum: 1 },
            },
        },
        { $sort: { averageRating: 1 } }, // Lowest rated first
    ]);

    // Get trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await FeedbackModel.aggregate([
        { $match: { ...filter, submittedAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { category: '$category', month: '$month', year: '$year' },
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get total feedback count
    const totalFeedback = await FeedbackModel.countDocuments(filter);

    res.json({
        categoryAverages,
        trends,
        totalFeedback,
    });
}

export async function getFeedbackByCategory(req: any, res: any) {
    const { category } = req.params;
    const { hostel, limit = 50 } = req.query;

    const filter: any = { category };
    if (hostel && hostel !== 'all') {
        filter.hostel = hostel;
    }

    const feedback = await FeedbackModel.find(filter)
        .sort({ submittedAt: -1 })
        .limit(Number(limit));

    res.json(feedback.map(f => f.toJSON()));
}
