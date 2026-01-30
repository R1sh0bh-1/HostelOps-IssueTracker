import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { IssueList } from '@/components/issue/IssueList';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';

const MyIssues = () => {
  const { user } = useAuth();
  const { issues, loading } = useIssues();
  const navigate = useNavigate();

  // Filter to show only user's issues
  const myIssues = issues.filter(issue => issue.reportedBy.id === user?.id);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            My Issues
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track the status of issues you've reported
          </p>
        </div>

        <IssueList
          issues={myIssues}
          loading={loading}
          onNewIssue={() => navigate('/report')}
          onIssueClick={(issue) => console.log('View issue:', issue.id)}
        />
      </motion.div>
    </AppLayout>
  );
};

export default MyIssues;
