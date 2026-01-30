import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  CheckCircle,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Merge,
  AlertTriangle,
  MessagesSquare,
  UserPlus
} from 'lucide-react';
import Confetti from 'react-confetti';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIssues } from '@/hooks/useIssues';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES, PRIORITIES, STATUSES, HOSTELS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { RemarksModal } from './RemarksModal';
import { ResolveModal } from './ResolveModal';
import { AssignIssueModal } from './AssignIssueModal';
import { IssueThreadModal } from '@/components/thread/IssueThreadModal';
import { Issue } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { apiFetch } from '@/utils/apiClient';

interface IssueManagementPanelProps {
  searchQuery: string;
}

export function IssueManagementPanel({ searchQuery }: IssueManagementPanelProps) {
  const { issues, loading, updateStatus, refetch } = useIssues();
  const { toast } = useToast();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [hostelFilter, setHostelFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection & Modals
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [threadIssue, setThreadIssue] = useState<Issue | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignIssue, setAssignIssue] = useState<Issue | null>(null);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  const openThreadModal = (issue: Issue) => {
    setThreadIssue(issue);
    setThreadModalOpen(true);
  };

  const openAssignModal = (issue: Issue) => {
    setAssignIssue(issue);
    setAssignModalOpen(true);
  };

  const handleAssigned = async () => {
    await refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Apply filters with debounce-like behavior using useMemo
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search filter
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !issue.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;

      // Hostel filter
      if (hostelFilter !== 'all' && !issue.location.hostel.toLowerCase().includes(hostelFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter, priorityFilter, hostelFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(paginatedIssues.map(i => i.id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues(prev => [...prev, issueId]);
    } else {
      setSelectedIssues(prev => prev.filter(id => id !== issueId));
    }
  };

  const handleResolveWithProof = async (issue: Issue, proofFiles: File[], remarks: string) => {
    try {
      // Upload all proof files
      const form = new FormData();
      proofFiles.forEach(file => form.append('proofs', file));
      const uploaded = await apiFetch<{ proofs: any[] }>('/api/upload/proofs', {
        method: 'POST',
        body: form,
      });

      await issueService.setResolutionProof(issue.id, uploaded.proofs, remarks);
      await updateStatus(issue.id, 'resolved');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: "Great job! 🎉",
        description: `Issue "${issue.title}" has been resolved with proof!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkAction = async (action: 'resolve' | 'merge') => {
    if (action === 'resolve') {
      toast({
        title: "Bulk Resolve",
        description: `${selectedIssues.length} issues marked for resolution`,
      });
    } else if (action === 'merge') {
      toast({
        title: "Merge Issues",
        description: "Select a primary issue to merge duplicates",
      });
    }
    setSelectedIssues([]);
  };

  const openResolveModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setResolveModalOpen(true);
  };

  const openRemarksModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setRemarksModalOpen(true);
  };

  const handleRemarksSaved = async () => {
    await refetch();
  };

  const handleDeleteIssue = async (issue: Issue) => {
    const confirmed = window.confirm(`Delete issue "${issue.title}" ? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await issueService.deleteIssue(issue.id);
      toast({
        title: 'Issue deleted',
        description: `Deleted "${issue.title}".`,
      });
      await refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete issue',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setHostelFilter('all');
    setCurrentPage(1);
  };

  return (
    <>
      {/* Confetti effect on resolution */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Issue Management</h1>
            <p className="mt-1 text-muted-foreground">
              {filteredIssues.length} issues found
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary">{selectedIssues.length} selected</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('resolve')}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Resolve All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('merge')}
              >
                <Merge className="mr-1 h-4 w-4" />
                Merge
              </Button>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={hostelFilter} onValueChange={setHostelFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Hostel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  {HOSTELS.map(hostel => (
                    <SelectItem key={hostel.value} value={hostel.value}>
                      {hostel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Issues management table">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedIssues.length === paginatedIssues.length && paginatedIssues.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all issues"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Issue</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Assigned To</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading issues...
                      </div>
                    </td>
                  </tr>
                ) : paginatedIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No issues found matching your filters
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {paginatedIssues.map((issue, index) => (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          'border-b transition-colors hover:bg-muted/30',
                          issue.priority === 'emergency' && 'bg-destructive-muted/30'
                        )}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedIssues.includes(issue.id)}
                            onCheckedChange={(checked) => handleSelectIssue(issue.id, !!checked)}
                            aria-label={`Select issue ${issue.title} `}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {CATEGORIES.find(c => c.value === issue.category)?.icon}
                            </span>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">
                                {issue.priority === 'emergency' && (
                                  <AlertTriangle className="mr-1 inline h-4 w-4 text-destructive" />
                                )}
                                {issue.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                by {issue.reportedBy.name} • {new Date(issue.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{issue.location.hostel}</p>
                          <p className="text-xs text-muted-foreground">
                            Block {issue.location.block}, Room {issue.location.room}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={issue.priority as any}
                            className="capitalize"
                          >
                            {issue.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {issue.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(issue.assignedTo.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">{issue.assignedTo.name}</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(issue)}
                              className="h-7 text-xs"
                            >
                              <UserPlus className="mr-1 h-3 w-3" />
                              Assign
                            </Button>
                          )}
                        </td>
                        <td className="p-4">
                          <Select
                            value={issue.status}
                            onValueChange={(newStatus) => updateStatus(issue.id, newStatus as any)}
                          >
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue>
                                <Badge
                                  variant={issue.status as any}
                                  className="capitalize"
                                >
                                  {STATUSES.find(s => s.value === issue.status)?.label || issue.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={status.value as any} className="capitalize">
                                      {status.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openRemarksModal(issue)}
                              aria-label="Add remarks"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  aria-label="More actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openThreadModal(issue)}>
                                  <MessagesSquare className="mr-2 h-4 w-4 text-primary" />
                                  View Discussion
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openResolveModal(issue)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-success" />
                                  Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteIssue(issue)}>
                                  Delete Issue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of{' '}
                {filteredIssues.length} issues
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <ResolveModal
        open={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        issue={selectedIssue}
        onResolve={handleResolveWithProof}
      />
      <RemarksModal
        open={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        issue={selectedIssue}
        onSaved={handleRemarksSaved}
      />
      <IssueThreadModal
        issue={threadIssue}
        open={threadModalOpen}
        onClose={() => setThreadModalOpen(false)}
      />
      <AssignIssueModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        issue={assignIssue}
        onAssigned={handleAssigned}
      />
    </>
  );
}
