import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SimilarIssue } from '@/types/issue';
import { AlertCircle, GitMerge, Percent } from 'lucide-react';
import { useState } from 'react';

interface DuplicateDetectionPanelProps {
    similarIssues: SimilarIssue[];
    onMerge: (duplicateIds: string[]) => void;
    isLoading?: boolean;
}

export function DuplicateDetectionPanel({ similarIssues, onMerge, isLoading }: DuplicateDetectionPanelProps) {
    const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

    const toggleIssueSelection = (issueId: string) => {
        const newSelection = new Set(selectedIssues);
        if (newSelection.has(issueId)) {
            newSelection.delete(issueId);
        } else {
            newSelection.add(issueId);
        }
        setSelectedIssues(newSelection);
    };

    const handleMerge = () => {
        if (selectedIssues.size > 0) {
            onMerge(Array.from(selectedIssues));
            setSelectedIssues(new Set());
        }
    };

    if (similarIssues.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No similar issues detected</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitMerge className="h-5 w-5" />
                    Potential Duplicates
                </CardTitle>
                <CardDescription>
                    {similarIssues.length} similar {similarIssues.length === 1 ? 'issue' : 'issues'} detected
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {similarIssues.map((similar) => (
                            <div
                                key={similar.issue.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedIssues.has(similar.issue.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                onClick={() => toggleIssueSelection(similar.issue.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm">{similar.issue.title}</h4>
                                            <Badge variant="outline" className="ml-auto">
                                                <Percent className="h-3 w-3 mr-1" />
                                                {Math.round(similar.similarityScore * 100)}% match
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{similar.issue.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {similar.matchReasons.map((reason, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {reason}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Category: {similar.issue.category}</span>
                                            <span>•</span>
                                            <span>
                                                Location: {similar.issue.location.hostel} - {similar.issue.location.block} -{' '}
                                                {similar.issue.location.room}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {selectedIssues.size > 0 && (
                    <>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {selectedIssues.size} {selectedIssues.size === 1 ? 'issue' : 'issues'} selected
                            </p>
                            <Button onClick={handleMerge} disabled={isLoading} size="sm">
                                <GitMerge className="h-4 w-4 mr-2" />
                                Merge Selected
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
