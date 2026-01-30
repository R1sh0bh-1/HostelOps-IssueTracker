import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { IssueForm } from '@/components/issue/IssueForm';

const ReportIssue = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Issue Form */}
        <IssueForm
          onSuccess={() => navigate('/')}
          onCancel={() => navigate(-1)}
        />
      </div>
    </AppLayout>
  );
};

export default ReportIssue;
