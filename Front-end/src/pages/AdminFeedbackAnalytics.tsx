import { useState, useEffect } from 'react';
import { TrendingDown, Users, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feedbackService } from '@/services/feedbackService';
import { FeedbackAnalytics, FEEDBACK_CATEGORIES } from '@/types/feedback';
import { FeedbackStarRating } from '@/components/feedback/FeedbackStarRating';
import { HOSTELS } from '@/utils/constants';

export function AdminFeedbackAnalytics() {
    const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [hostelFilter, setHostelFilter] = useState('all');

    useEffect(() => {
        loadAnalytics();
    }, [hostelFilter]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const data = await feedbackService.getAnalytics({
                hostel: hostelFilter !== 'all' ? hostelFilter : undefined,
            });
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    const lowestRated = analytics?.categoryAverages[0];
    const highestRated = analytics?.categoryAverages[analytics.categoryAverages.length - 1];

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Feedback Analytics</h1>
                    <p className="mt-2 text-muted-foreground">
                        Monitor student satisfaction and identify areas for improvement
                    </p>
                </div>

                <Select value={hostelFilter} onValueChange={setHostelFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by hostel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Hostels</SelectItem>
                        {HOSTELS.map((hostel) => (
                            <SelectItem key={hostel.value} value={hostel.value}>
                                {hostel.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalFeedback || 0}</div>
                        <p className="text-xs text-muted-foreground">Submissions received</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lowest Rated</CardTitle>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {FEEDBACK_CATEGORIES.find((c) => c.value === lowestRated?._id)?.label || 'N/A'}
                        </div>
                        <div className="mt-1">
                            {lowestRated && <FeedbackStarRating rating={Math.round(lowestRated.averageRating)} readonly size="sm" />}
                            <p className="text-xs text-muted-foreground mt-1">
                                {lowestRated?.averageRating.toFixed(2)} average
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Rated</CardTitle>
                        <BarChart3 className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {FEEDBACK_CATEGORIES.find((c) => c.value === highestRated?._id)?.label || 'N/A'}
                        </div>
                        <div className="mt-1">
                            {highestRated && <FeedbackStarRating rating={Math.round(highestRated.averageRating)} readonly size="sm" />}
                            <p className="text-xs text-muted-foreground mt-1">
                                {highestRated?.averageRating.toFixed(2)} average
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics?.categoryAverages.map((cat) => {
                            const category = FEEDBACK_CATEGORIES.find((c) => c.value === cat._id);
                            const percentage = (cat.averageRating / 5) * 100;

                            return (
                                <div key={cat._id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{category?.icon}</span>
                                            <span className="font-medium">{category?.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FeedbackStarRating rating={Math.round(cat.averageRating)} readonly size="sm" />
                                            <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                                                {cat.averageRating.toFixed(1)}
                                            </span>
                                            <span className="text-xs text-muted-foreground w-20 text-right">
                                                ({cat.totalFeedback} reviews)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(!analytics?.categoryAverages || analytics.categoryAverages.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                            No feedback data available yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Action Items */}
            {lowestRated && lowestRated.averageRating < 3 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <TrendingDown className="h-5 w-5" />
                            Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            <strong>{FEEDBACK_CATEGORIES.find((c) => c.value === lowestRated._id)?.label}</strong> has
                            received a low average rating of <strong>{lowestRated.averageRating.toFixed(2)}</strong>.
                            Immediate attention and improvement measures are recommended.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
