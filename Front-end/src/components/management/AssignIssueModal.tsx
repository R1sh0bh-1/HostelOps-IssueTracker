import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { staffService, type Staff } from '@/services/staffService';
import { issueService } from '@/services/issueService';
import { Issue } from '@/types/issue';
import { CATEGORIES } from '@/utils/constants';

interface AssignIssueModalProps {
    open: boolean;
    onClose: () => void;
    issue: Issue | null;
    onAssigned: () => void;
}

export function AssignIssueModal({ open, onClose, issue, onAssigned }: AssignIssueModalProps) {
    const { toast } = useToast();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    useEffect(() => {
        if (open && issue) {
            loadStaff();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, issue]);

    const loadStaff = async () => {
        if (!issue) return;

        setLoading(true);
        try {
            const data = await staffService.getStaffByCategory(issue.category);
            setStaff(data);
            setSelectedStaffId(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load staff members',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!issue || !selectedStaffId) return;

        setAssigning(true);
        try {
            await issueService.assignIssue(issue.id, selectedStaffId);
            toast({
                title: 'Issue Assigned',
                description: `Issue assigned to ${staff.find(s => s.id === selectedStaffId)?.name}`,
            });
            onAssigned();
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to assign issue',
                variant: 'destructive',
            });
        } finally {
            setAssigning(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!issue) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Assign Issue to Staff</DialogTitle>
                    <DialogDescription>
                        Select a staff member to assign this {CATEGORIES.find(c => c.value === issue.category)?.label.toLowerCase()} issue to.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Issue Info */}
                    <div className="rounded-lg border p-3 bg-muted/30">
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {issue.location.hostel} - Block {issue.location.block}, Room {issue.location.room}
                        </p>
                    </div>

                    {/* Staff List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                                ))}
                            </div>
                        ) : staff.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No staff members available for this category.
                                <br />
                                Add staff members in the Manage Staff panel.
                            </div>
                        ) : (
                            staff.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedStaffId(member.id)}
                                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selectedStaffId === member.id
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                        <Badge variant="secondary" className="text-xs mt-1">
                                            {member.hostel}
                                        </Badge>
                                    </div>

                                    {selectedStaffId === member.id && (
                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-white" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedStaffId || assigning}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Issue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
