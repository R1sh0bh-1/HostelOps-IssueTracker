import { motion } from 'framer-motion';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIssues } from '@/hooks/useIssues';
import { staffService, type Staff } from '@/services/staffService';
import { CATEGORIES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface ManagementStatsProps {
  onNavigate: (tab: 'overview' | 'issues' | 'threads' | 'staff' | 'analytics' | 'announcements' | 'lostfound') => void;
}

export function ManagementStats({ onNavigate }: ManagementStatsProps) {
  const { issues, loading } = useIssues();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await staffService.getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoadingStaff(false);
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

  // Calculate comprehensive stats
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'reported').length,
    inProgress: issues.filter(i => ['assigned', 'in-progress'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    emergency: issues.filter(i => i.priority === 'emergency' && i.status !== 'resolved' && i.status !== 'closed').length,
    avgResolutionTime: '2.4 days',
    resolutionRate: 75,
  };

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.total,
      change: '+12%',
      changeType: 'neutral',
      icon: ClipboardList,
      bgClass: 'bg-primary-muted',
      textClass: 'text-primary',
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      change: '-8%',
      changeType: 'positive',
      icon: Clock,
      bgClass: 'bg-warning-muted',
      textClass: 'text-warning',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      change: '+5%',
      changeType: 'neutral',
      icon: Zap,
      bgClass: 'bg-accent',
      textClass: 'text-accent-foreground',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      change: '+23%',
      changeType: 'positive',
      icon: CheckCircle,
      bgClass: 'bg-success-muted',
      textClass: 'text-success',
    },
  ];

  const recentIssues = issues.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here's what's happening in your hostels today.
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => onNavigate('issues')}
        >
          View All Issues
        </Button>
      </div>

      {/* Emergency Alert */}
      {stats.emergency > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-destructive bg-destructive-muted p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-destructive">
              {stats.emergency} Emergency {stats.emergency === 1 ? 'Issue' : 'Issues'} Pending!
            </p>
            <p className="text-sm text-muted-foreground">
              Immediate attention required for critical hostel issues.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onNavigate('issues')}
          >
            View Now
          </Button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-lift border-0 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className={cn('text-3xl font-bold', stat.textClass)}>
                        {loading ? '...' : stat.value}
                      </p>
                      <span className={cn(
                        'flex items-center text-xs font-medium',
                        stat.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'
                      )}>
                        {stat.changeType === 'positive' ? (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn('rounded-xl p-3', stat.bgClass)}>
                    <stat.icon className={cn('h-6 w-6', stat.textClass)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Issues */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Issues</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('issues')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : recentIssues.length > 0 ? (
              recentIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                    issue.priority === 'emergency' && 'border-l-4 border-l-destructive'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg',
                    issue.priority === 'emergency' ? 'bg-destructive-muted' : 'bg-primary-muted'
                  )}>
                    {issue.category === 'plumbing' && '🚿'}
                    {issue.category === 'electrical' && '⚡'}
                    {issue.category === 'cleanliness' && '🧹'}
                    {issue.category === 'internet' && '📶'}
                    {issue.category === 'furniture' && '🪑'}
                    {issue.category === 'security' && '🔒'}
                    {issue.category === 'other' && '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.location.hostel} • {issue.location.room}
                    </p>
                  </div>
                  <span className={cn(
                    'shrink-0 rounded-full px-2 py-1 text-xs font-medium',
                    issue.status === 'reported' && 'bg-primary-muted text-primary',
                    issue.status === 'in-progress' && 'bg-accent text-accent-foreground',
                    issue.status === 'resolved' && 'bg-success-muted text-success'
                  )}>
                    {issue.status}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">No recent issues</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Performance */}
        <div className="space-y-6">
          {/* Performance Card */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                  <p className="text-2xl font-bold text-foreground">{stats.avgResolutionTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-success">{stats.resolutionRate}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Target</span>
                  <span className="font-medium text-foreground">75/100 issues</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => onNavigate('announcements')}
              >
                <span className="text-2xl">📢</span>
                <span className="text-xs">New Announcement</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => onNavigate('analytics')}
              >
                <span className="text-2xl">📊</span>
                <span className="text-xs">View Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => onNavigate('lostfound')}
              >
                <span className="text-2xl">📦</span>
                <span className="text-xs">Lost & Found</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => onNavigate('staff')}
              >
                <span className="text-2xl">👥</span>
                <span className="text-xs">Manage Staff</span>
              </Button>
            </CardContent>
          </Card>

          {/* Staff Overview */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Members
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('staff')}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Add Staff
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingStaff ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : staff.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {staff.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORIES.find(c => c.value === member.specialty)?.icon}{' '}
                            {CATEGORIES.find(c => c.value === member.specialty)?.label}
                          </Badge>
                          {member.phone && (
                            <span className="text-xs text-muted-foreground">📞 {member.phone}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {member.hostel === 'All' ? 'All' : member.hostel.split(' ')[0]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No staff members yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onNavigate('staff')}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Add First Staff Member
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
