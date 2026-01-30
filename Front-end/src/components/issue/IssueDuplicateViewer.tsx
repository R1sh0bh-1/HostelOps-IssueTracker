import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Issue, SimilarIssue } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { DuplicateDetectionPanel } from './DuplicateDetectionPanel';
import { MergeIssuesModal } from './MergeIssuesModal';
import { GitMerge, Loader2 } from 'lucide-react';

interface IssueDuplicateViewerProps {
    issue: Issue;
    onMergeComplete?: () => void;
}

export function IssueDuplicateViewer({ issue, onMergeComplete }: IssueDuplicateViewerProps) {
    const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const [merging, setMerging] = useState(false);
    const [mergeModalOpen, setMergeModalOpen] = useState(false);
    const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        loadSimilarIssues();
    }, [issue.id]);

    const loadSimilarIssues = async () => {
        try {
            setLoading(true);
            const similar = await issueService.findSimilarIssues(issue.id);
            setSimilarIssues(similar);
        } catch (error) {
            console.error('Failed to load similar issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMergeRequest = (duplicateIds: string[]) => {
        setSelectedDuplicates(duplicateIds);
        setMergeModalOpen(true);
    };

    const handleConfirmMerge = async () => {
        try {
            setMerging(true);
            await issueService.mergeIssues(issue.id, selectedDuplicates);

            toast({
                title: 'Issues Merged Successfully',
                description: `Merged ${selectedDuplicates.length} duplicate ${selectedDuplicates.length === 1 ? 'issue' : 'issues'} into this issue.`,
            });

            setMergeModalOpen(false);
            setSelectedDuplicates([]);
            await loadSimilarIssues(); // Reload to update the list
            onMergeComplete?.();
        } catch (error) {
            toast({
                title: 'Merge Failed',
                description: 'Failed to merge issues. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setMerging(false);
        }
    };

    const getDuplicateIssues = (): Issue[] => {
        return similarIssues
            .filter((s) => selectedDuplicates.includes(s.issue.id))
            .map((s) => s.issue);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <GitMerge className="h-5 w-5" />
                            Duplicate Detection
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Automatically detected similar issues that might be duplicates
                        </p>
                    </div>
                    {similarIssues.length > 0 && (
                        <Button variant="outline" size="sm" onClick={loadSimilarIssues}>
                            Refresh
                        </Button>
                    )}
                </div>

                <DuplicateDetectionPanel
                    similarIssues={similarIssues}
                    onMerge={handleMergeRequest}
                    isLoading={merging}
                />
            </div>

            <MergeIssuesModal
                open={mergeModalOpen}
                onClose={() => setMergeModalOpen(false)}
                onConfirm={handleConfirmMerge}
                primaryIssue={issue}
                duplicateIssues={getDuplicateIssues()}
                isLoading={merging}
            />
        </>
    );
}
