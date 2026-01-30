import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, History, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { feedbackService } from '@/services/feedbackService';
import { Feedback, FEEDBACK_CATEGORIES, FeedbackCategory } from '@/types/feedback';
import { FeedbackStarRating } from '@/components/feedback/FeedbackStarRating';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function StudentFeedbackPanel() {
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myFeedback, setMyFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyFeedback();
    }, []);

    const loadMyFeedback = async () => {
        try {
            const data = await feedbackService.getMyFeedback();
            setMyFeedback(data);
        } catch (error) {
            console.error('Failed to load feedback history:', error);
        } finally {
            setLoading(false);
        }
    };

    const canSubmitForCategory = (category: FeedbackCategory): boolean => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        return !myFeedback.some(
            (f) => f.category === category && f.month === currentMonth && f.year === currentYear
        );
    };

    const handleSubmit = async () => {
        if (!selectedCategory || rating === 0) {
            toast({
                title: 'Incomplete Form',
                description: 'Please select a category and rating',
                variant: 'destructive',
            });
            return;
        }

        if (!canSubmitForCategory(selectedCategory)) {
            toast({
                title: 'Already Submitted',
                description: `You have already submitted feedback for ${FEEDBACK_CATEGORIES.find(c => c.value === selectedCategory)?.label} this month`,
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await feedbackService.submitFeedback({
                category: selectedCategory,
                rating,
                comment: comment.trim() || undefined,
            });

            toast({
                title: 'Feedback Submitted! 🎉',
                description: 'Thank you for helping us improve the hostel',
            });

            // Reset form
            setSelectedCategory(null);
            setRating(0);
            setComment('');

            // Reload feedback history
            await loadMyFeedback();
        } catch (error: any) {
            toast({
                title: 'Submission Failed',
                description: error.message || 'Failed to submit feedback. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryFeedback = (category: FeedbackCategory) => {
        return myFeedback.find(
            (f) => f.category === category && f.month === new Date().getMonth() + 1 && f.year === new Date().getFullYear()
        );
    };

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Hostel Feedback</h1>
                <p className="mt-2 text-muted-foreground">
                    Share your experience to help us improve hostel facilities and services
                </p>
            </div>

            {/* Category Selection Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Select a Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {FEEDBACK_CATEGORIES.map((category) => {
                            const existingFeedback = getCategoryFeedback(category.value);
                            const canSubmit = canSubmitForCategory(category.value);

                            return (
                                <motion.button
                                    key={category.value}
                                    whileHover={canSubmit ? { scale: 1.02 } : {}}
                                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                                    onClick={() => canSubmit && setSelectedCategory(category.value)}
                                    disabled={!canSubmit}
                                    className={`relative rounded-lg border-2 p-4 text-left transition-all ${selectedCategory === category.value
                                            ? 'border-primary bg-primary/5'
                                            : canSubmit
                                                ? 'border-border hover:border-primary/50'
                                                : 'border-border bg-muted/50 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{category.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{category.label}</p>
                                            {existingFeedback ? (
                                                <div className="mt-1">
                                                    <FeedbackStarRating rating={existingFeedback.rating} readonly size="sm" />
                                                    <p className="mt-1 text-xs text-muted-foreground">Submitted this month</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Click to rate</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Form */}
            {selectedCategory && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">
                                    {FEEDBACK_CATEGORIES.find((c) => c.value === selectedCategory)?.icon}
                                </span>
                                Rate {FEEDBACK_CATEGORIES.find((c) => c.value === selectedCategory)?.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Your Rating <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center gap-4">
                                    <FeedbackStarRating rating={rating} onRatingChange={setRating} size="lg" />
                                    {rating > 0 && (
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {rating === 1 && 'Poor'}
                                            {rating === 2 && 'Fair'}
                                            {rating === 3 && 'Good'}
                                            {rating === 4 && 'Very Good'}
                                            {rating === 5 && 'Excellent'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-sm font-medium">
                                    Additional Comments (Optional)
                                </Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Share your thoughts, suggestions, or concerns..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {comment.length}/500 characters
                                </p>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    You can submit feedback for each category once per month. Your feedback helps us improve!
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setRating(0);
                                        setComment('');
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
                                    {isSubmitting ? (
                                        <>Submitting...</>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Feedback History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Your Feedback History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : myFeedback.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No feedback submitted yet. Start by selecting a category above!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {myFeedback.slice(0, 10).map((feedback) => {
                                const category = FEEDBACK_CATEGORIES.find((c) => c.value === feedback.category);
                                return (
                                    <div key={feedback.id} className="rounded-lg border p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{category?.icon}</span>
                                                <div>
                                                    <p className="font-medium text-foreground">{category?.label}</p>
                                                    <FeedbackStarRating rating={feedback.rating} readonly size="sm" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(feedback.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {feedback.comment && (
                                            <p className="mt-2 text-sm text-muted-foreground">{feedback.comment}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
