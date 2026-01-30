import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { IssueList } from '@/components/issue/IssueList';
import { AnnouncementsList } from '@/components/announcements/AnnouncementsList';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { issues, loading } = useIssues();
  const navigate = useNavigate();

  // Calculate stats
  const stats = {
    total: issues.length,
    open: issues.filter(i => ['reported', 'assigned', 'in-progress'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    emergency: issues.filter(i => i.priority === 'emergency' && i.status !== 'resolved' && i.status !== 'closed').length,
  };

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.total,
      icon: ClipboardList,
      color: 'primary',
      bgClass: 'bg-primary-muted',
      textClass: 'text-primary',
    },
    {
      title: 'Open Issues',
      value: stats.open,
      icon: Clock,
      color: 'warning',
      bgClass: 'bg-warning-muted',
      textClass: 'text-warning',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'success',
      bgClass: 'bg-success-muted',
      textClass: 'text-success',
    },
    {
      title: 'Emergency',
      value: stats.emergency,
      icon: AlertTriangle,
      color: 'destructive',
      bgClass: 'bg-destructive-muted',
      textClass: 'text-destructive',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track and manage hostel issues efficiently
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Report New Issue
          </Button>
        </motion.div>

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
                      <p className={cn('mt-1 text-3xl font-bold', stat.textClass)}>
                        {stat.value}
                      </p>
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

        {/* Announcements (from admin) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnnouncementsList />
        </motion.div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <IssueList
                issues={issues.slice(0, 5)}
                loading={loading}
                onIssueClick={(issue) => console.log('View issue:', issue.id)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
