import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Megaphone,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  MessageSquare,
  Users,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationsPanel } from '@/components/management/NotificationsPanel';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useSocket } from '@/context/SocketContext';
import { apiFetch } from '@/utils/apiClient';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationBar } from '@/components/NotificationBar';

// Sub-components
import { IssueManagementPanel } from '@/components/management/IssueManagementPanel';
import { AnalyticsOverview } from '@/components/management/AnalyticsOverview';
import { AnnouncementsPanel } from '@/components/management/AnnouncementsPanel';
import { LostFoundPanel } from '@/components/management/LostFoundPanel';
import { ManagementStats } from '@/components/management/ManagementStats';
import { ThreadsManagementPanel } from '@/components/management/ThreadsManagementPanel';
import { ManageStaffPanel } from '@/components/management/ManageStaffPanel';
import { AdminFeedbackAnalytics } from '../AdminFeedbackAnalytics';

type TabType = 'overview' | 'issues' | 'threads' | 'analytics' | 'announcements' | 'lostfound' | 'staff' | 'feedback';

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
  { id: 'issues' as TabType, label: 'Issues', icon: ClipboardList, badgeType: 'issues' },
  { id: 'threads' as TabType, label: 'Discussions', icon: MessageSquare, badgeType: 'threads' },
  { id: 'staff' as TabType, label: 'Manage Staff', icon: Users },
  { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  { id: 'feedback' as TabType, label: 'Feedback Analytics', icon: Star },
  { id: 'announcements' as TabType, label: 'Announcements', icon: Megaphone },
  { id: 'lostfound' as TabType, label: 'Lost & Found', icon: Package, badgeType: 'lostfound' },
];

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const [threadCount, setThreadCount] = useState(0);
  const [lostFoundCount, setLostFoundCount] = useState(0);

  // Use socket and notifications from context
  const { socket } = useSocket();
  const { unreadCount } = useNotifications();

  // Fetch active issue count
  const fetchIssueCount = async () => {
    try {
      const res = await apiFetch<any[]>('/api/issues');
      const active = res.filter(i =>
        ['reported', 'assigned', 'in-progress'].includes(i.status)
      );
      setIssueCount(active.length);
    } catch (err) {
      console.error("Failed to fetch issue count", err);
    }
  };

  // Fetch thread count
  const fetchThreadCount = async () => {
    try {
      const res = await apiFetch<any[]>('/api/threads');
      setThreadCount(res.length || 0);
    } catch (err) {
      console.error("Failed to fetch thread count", err);
    }
  };

  // Fetch lost & found count
  const fetchLostFoundCount = async () => {
    try {
      const res = await apiFetch<any[]>('/api/lostfound');
      const unresolved = res.filter(i => !i.isResolved);
      setLostFoundCount(unresolved.length || 0);
    } catch (err) {
      console.error("Failed to fetch lost & found count", err);
    }
  };

  useEffect(() => {
    fetchIssueCount();
    fetchThreadCount();
    fetchLostFoundCount();

    if (!socket) return;

    const handleIssueChange = () => {
      console.log("Issue changed, updating count...");
      fetchIssueCount();
    };

    const handleThreadChange = () => {
      fetchThreadCount();
    };

    const handleLostFoundChange = () => {
      fetchLostFoundCount();
    };

    socket.on('issue:created', handleIssueChange);
    socket.on('issue:updated', handleIssueChange);
    socket.on('issue:deleted', handleIssueChange);
    socket.on('issue:auto-merged', handleIssueChange);
    socket.on('issue:merged', handleIssueChange);
    socket.on('issue:unmerged', handleIssueChange);

    socket.on('thread:created', handleThreadChange);
    socket.on('thread:updated', handleThreadChange);
    socket.on('thread:deleted', handleThreadChange);

    socket.on('lostfound:created', handleLostFoundChange);
    socket.on('lostfound:updated', handleLostFoundChange);
    socket.on('lostfound:deleted', handleLostFoundChange);

    return () => {
      socket.off('issue:created', handleIssueChange);
      socket.off('issue:updated', handleIssueChange);
      socket.off('issue:deleted', handleIssueChange);
      socket.off('issue:auto-merged', handleIssueChange);
      socket.off('issue:merged', handleIssueChange);
      socket.off('issue:unmerged', handleIssueChange);

      socket.off('thread:created', handleThreadChange);
      socket.off('thread:updated', handleThreadChange);
      socket.off('thread:deleted', handleThreadChange);

      socket.off('lostfound:created', handleLostFoundChange);
      socket.off('lostfound:updated', handleLostFoundChange);
      socket.off('lostfound:deleted', handleLostFoundChange);
    };
  }, [socket]);

  // Helper to get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Redirect non-management users
  if (user?.role !== 'management' && user?.role !== 'warden') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive-muted">
            <Settings className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access the management dashboard.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ManagementStats onNavigate={setActiveTab} />;
      case 'issues':
        return <IssueManagementPanel searchQuery={searchQuery} />;
      case 'threads':
        return <ThreadsManagementPanel />;
      case 'staff':
        return <ManageStaffPanel />;
      case 'analytics':
        return <AnalyticsOverview />;
      case 'feedback':
        return <AdminFeedbackAnalytics />;
      case 'announcements':
        return <AnnouncementsPanel />;
      case 'lostfound':
        return <LostFoundPanel />;
      default:
        return <ManagementStats onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                  <span className="text-lg font-bold text-primary-foreground">H</span>
                </div>
                <div>
                  <h1 className="font-bold text-sidebar-foreground">HostelHub</h1>
                  <p className="text-xs text-sidebar-foreground/60">Management</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            // Determine badge content based on badgeType
            let badgeContent: React.ReactNode = null;
            if ('badgeType' in tab && tab.badgeType) {
              if (tab.badgeType === 'issues' && issueCount > 0) {
                badgeContent = issueCount;
              } else if (tab.badgeType === 'threads' && threadCount > 0) {
                badgeContent = threadCount;
              } else if (tab.badgeType === 'lostfound' && lostFoundCount > 0) {
                badgeContent = lostFoundCount;
              }
            }

            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )}
              >
                <tab.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {badgeContent && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                        {badgeContent}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn(
            'flex items-center gap-3 rounded-lg bg-sidebar-accent p-3',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        sidebarCollapsed ? 'ml-20' : 'ml-[280px]'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search issues, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="View notifications"
              onClick={() => setNotificationsPanelOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>

            {/* Profile Avatar - Navigates to profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="relative"
              aria-label="View profile"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary-muted text-primary text-xs font-medium">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Back to main app */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              Back to App
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications Panel */}
      <NotificationsPanel
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />

      {/* Real-time Notification Bar */}
      <NotificationBar />
    </div>
  );
};

export default ManagementDashboard;
