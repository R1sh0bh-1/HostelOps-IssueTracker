import { Feedback, FeedbackFormData, FeedbackAnalytics, FeedbackCategory } from '@/types/feedback';
import { apiFetch } from '@/utils/apiClient';

function mapFeedback(raw: any): Feedback {
    return {
        ...raw,
        submittedAt: new Date(raw.submittedAt),
    };
}

export const feedbackService = {
    // Submit new feedback
    async submitFeedback(data: FeedbackFormData): Promise<Feedback> {
        const created = await apiFetch<any>('/api/feedback', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return mapFeedback(created);
    },

    // Get current user's feedback history
    async getMyFeedback(): Promise<Feedback[]> {
        const data = await apiFetch<any[]>('/api/feedback/my');
        return data.map(mapFeedback);
    },

    // Get analytics (admin only)
    async getAnalytics(filters?: { hostel?: string; startDate?: string; endDate?: string }): Promise<FeedbackAnalytics> {
        const params = new URLSearchParams();
        if (filters?.hostel) params.append('hostel', filters.hostel);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const queryString = params.toString();
        const url = `/api/feedback/analytics${queryString ? `?${queryString}` : ''}`;

        return await apiFetch<FeedbackAnalytics>(url);
    },

    // Get feedback by category (admin only)
    async getFeedbackByCategory(category: FeedbackCategory, filters?: { hostel?: string; limit?: number }): Promise<Feedback[]> {
        const params = new URLSearchParams();
        if (filters?.hostel) params.append('hostel', filters.hostel);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const url = `/api/feedback/category/${category}${queryString ? `?${queryString}` : ''}`;

        const data = await apiFetch<any[]>(url);
        return data.map(mapFeedback);
    },
};
