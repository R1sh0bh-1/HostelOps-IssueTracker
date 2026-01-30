import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MessageSquare,
  CheckCircle2,
  Lock,
  Ban,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  MessageCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IssueThreadModal } from '@/components/thread/IssueThreadModal';
import { useIssues } from '@/hooks/useIssues';
import { useToast } from '@/hooks/use-toast';
import { threadService } from '@/services/threadService';
import { DiscussionThread } from '@/types/thread';
import { Issue } from '@/types/issue';
import { CATEGORIES } from '@/utils/constants';
import { cn } from '@/lib/utils';

export function ThreadsManagementPanel() {
  const { issues, loading: issuesLoading } = useIssues();
  const { toast } = useToast();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'blocked'>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const allThreads = await threadService.getAllThreads();
      setThreads(allThreads);
    } catch (err) {
      toast({
        title: 'Failed to load threads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIssueForThread = (thread: DiscussionThread): Issue | undefined => {
    return issues.find(i => i.id === thread.issueId);
  };

  const getThreadStatus = (thread: DiscussionThread): 'open' | 'resolved' | 'blocked' => {
    if (thread.isResolved) return 'resolved';
    if (thread.isBlocked) return 'blocked';
    return 'open';
  };

  const filteredThreads = threads.filter(thread => {
    const issue = getIssueForThread(thread);
    if (!issue) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = issue.title.toLowerCase().includes(query);
      const matchesComments = thread.comments.some(c => 
        c.content.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesComments) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const threadStatus = getThreadStatus(thread);
      if (threadStatus !== statusFilter) return false;
    }

    return true;
  });

  const handleQuickResolve = async (thread: DiscussionThread) => {
    try {
      await threadService.resolveThread(thread.id, 'management');
      await loadThreads();
      toast({
        title: 'Thread resolved',
        description: 'The discussion has been marked as resolved.',
      });
    } catch (err) {
      toast({
        title: 'Failed to resolve thread',
        variant: 'destructive',
      });
    }
  };

  const handleQuickBlock = async (thread: DiscussionThread) => {
    try {
      await threadService.blockThread(thread.id, 'management');
      await loadThreads();
      toast({
        title: 'Thread blocked',
        description: 'New comments are now disabled.',
      });
    } catch (err) {
      toast({
        title: 'Failed to block thread',
        variant: 'destructive',
      });
    }
  };

  const handleUnblock = async (thread: DiscussionThread) => {
    try {
      await threadService.unblockThread(thread.id);
      await loadThreads();
      toast({
        title: 'Thread unblocked',
        description: 'Comments are now enabled.',
      });
    } catch (err) {
      toast({
        title: 'Failed to unblock thread',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: threads.length,
    open: threads.filter(t => !t.isResolved && !t.isBlocked).length,
    resolved: threads.filter(t => t.isResolved).length,
    blocked: threads.filter(t => t.isBlocked && !t.isResolved).length,
  };

  if (loading || issuesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading threads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Discussion Threads</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and moderate all issue discussions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Threads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-primary">{stats.open}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive">{stats.blocked}</p>
              </div>
              <Ban className="h-8 w-8 text-destructive/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threads</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Threads List */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {filteredThreads.length} {filteredThreads.length === 1 ? 'thread' : 'threads'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3">
              <AnimatePresence>
                {filteredThreads.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No threads found</p>
                  </div>
                ) : (
                  filteredThreads.map((thread, index) => {
                    const issue = getIssueForThread(thread);
                    if (!issue) return null;

                    const category = CATEGORIES.find(c => c.value === issue.category);
                    const status = getThreadStatus(thread);

                    return (
                      <motion.div
                        key={thread.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          'group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
                          status === 'blocked' && 'border-destructive/30 bg-destructive/5',
                          status === 'resolved' && 'border-success/30 bg-success/5'
                        )}
                      >
                        {/* Icon */}
                        <span className="text-2xl">{category?.icon}</span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-foreground line-clamp-1">
                              {issue.title}
                            </h3>
                            {status === 'resolved' && (
                              <Badge variant="default" className="bg-success text-success-foreground text-[10px]">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                Resolved
                              </Badge>
                            )}
                            {status === 'blocked' && (
                              <Badge variant="destructive" className="text-[10px]">
                                <Lock className="h-2.5 w-2.5 mr-1" />
                                Blocked
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {thread.comments.length} comments
                            </span>
                            <span>
                              Last activity: {format(new Date(thread.updatedAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          {status === 'open' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleQuickResolve(thread)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                                  Resolve Thread
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickBlock(thread)}
                                  className="text-destructive"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Block Thread
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {status === 'blocked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblock(thread)}
                            >
                              Unblock
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Thread Modal */}
      <IssueThreadModal
        issue={selectedIssue}
        open={!!selectedIssue}
        onClose={() => {
          setSelectedIssue(null);
          loadThreads(); // Refresh after closing to get updated state
        }}
      />
    </div>
  );
}
