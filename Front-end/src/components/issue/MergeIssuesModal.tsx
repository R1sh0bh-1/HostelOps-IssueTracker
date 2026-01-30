import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Issue } from '@/types/issue';
import { AlertTriangle, GitMerge } from 'lucide-react';

interface MergeIssuesModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    primaryIssue: Issue;
    duplicateIssues: Issue[];
    isLoading?: boolean;
}

export function MergeIssuesModal({
    open,
    onClose,
    onConfirm,
    primaryIssue,
    duplicateIssues,
    isLoading,
}: MergeIssuesModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <GitMerge className="h-5 w-5" />
                        Merge Duplicate Issues
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will merge {duplicateIssues.length} duplicate {duplicateIssues.length === 1 ? 'issue' : 'issues'} into
                        the primary issue. The duplicate issues will be hidden from the main list.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    {/* Primary Issue */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="default">Primary Issue</Badge>
                        </h4>
                        <div className="p-3 border rounded-lg bg-primary/5">
                            <h5 className="font-medium text-sm mb-1">{primaryIssue.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2">{primaryIssue.description}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                    {primaryIssue.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {primaryIssue.priority}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Duplicate Issues */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="secondary">
                                {duplicateIssues.length} Duplicate {duplicateIssues.length === 1 ? 'Issue' : 'Issues'}
                            </Badge>
                        </h4>
                        <ScrollArea className="h-[200px] border rounded-lg p-3">
                            <div className="space-y-2">
                                {duplicateIssues.map((issue) => (
                                    <div key={issue.id} className="p-2 border rounded bg-muted/50">
                                        <h5 className="font-medium text-sm mb-1">{issue.title}</h5>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {issue.category}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {issue.location.hostel} - {issue.location.room}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Merged issues will be hidden from the main issue list but can be accessed from the primary issue. All
                                attachments and data will be preserved.
                            </p>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Merging...' : 'Confirm Merge'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
