import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { issueService } from '@/services/issueService';

interface RemarksModalProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  onSaved?: (updated: Issue) => void;
}

export function RemarksModal({ open, onClose, issue, onSaved }: RemarksModalProps) {
  const { toast } = useToast();
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRemarks(issue?.adminRemark?.content ?? '');
  }, [open, issue]);

  const handleSave = async () => {
    if (!issue) return;
    if (!remarks.trim()) return;

    try {
      setSaving(true);
      const updated = await issueService.addAdminRemark(issue.id, remarks.trim());
      toast({
        title: 'Remarks saved',
        description: 'Admin remark has been saved to this issue.',
      });
      onSaved?.(updated);
      onClose();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save remarks',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Add Remarks
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Add remarks for "{issue?.title}"
          </p>
          
          <Textarea
            placeholder="Enter your remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!remarks.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
