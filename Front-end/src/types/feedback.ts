export type FeedbackCategory =
    | 'hygiene'
    | 'mess_food'
    | 'washrooms'
    | 'rooms'
    | 'security'
    | 'staff_behavior';

export interface Feedback {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    category: FeedbackCategory;
    rating: number; // 1-5
    comment?: string;
    hostel: string;
    submittedAt: Date;
    month: number;
    year: number;
}

export interface FeedbackFormData {
    category: FeedbackCategory;
    rating: number;
    comment?: string;
}

export interface CategoryAverage {
    _id: FeedbackCategory;
    averageRating: number;
    totalFeedback: number;
}

export interface TrendData {
    _id: {
        category: FeedbackCategory;
        month: number;
        year: number;
    };
    averageRating: number;
    count: number;
}

export interface FeedbackAnalytics {
    categoryAverages: CategoryAverage[];
    trends: TrendData[];
    totalFeedback: number;
}

export const FEEDBACK_CATEGORIES = [
    { value: 'hygiene' as const, label: 'Hygiene', icon: '🧹' },
    { value: 'mess_food' as const, label: 'Mess Food', icon: '🍽️' },
    { value: 'washrooms' as const, label: 'Washrooms', icon: '🚿' },
    { value: 'rooms' as const, label: 'Rooms', icon: '🛏️' },
    { value: 'security' as const, label: 'Security', icon: '🔒' },
    { value: 'staff_behavior' as const, label: 'Staff Behavior', icon: '👥' },
];
