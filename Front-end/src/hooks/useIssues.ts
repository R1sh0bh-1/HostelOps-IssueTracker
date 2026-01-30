import { useState, useEffect, useCallback } from 'react';
import { Issue } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { Status } from '@/utils/constants';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssues();
      setIssues(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const updateStatus = async (id: string, status: Status) => {
    try {
      const updated = await issueService.updateStatus(id, status);
      setIssues(prev => prev.map(issue => (issue.id === id ? updated : issue)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const addIssue = (issue: Issue) => {
    setIssues(prev => [issue, ...prev]);
  };

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    updateStatus,
    addIssue,
  };
}
