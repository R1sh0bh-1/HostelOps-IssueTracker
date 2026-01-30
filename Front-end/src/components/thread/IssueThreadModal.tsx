import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreadView } from './ThreadView';
import { Issue } from '@/types/issue';
import { CATEGORIES, PRIORITIES } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { AttachmentGallery } from '@/components/common/AttachmentGallery';

interface IssueThreadModalProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
}

export function IssueThreadModal({ issue, open, onClose }: IssueThreadModalProps) {
  if (!issue) return null;

  const category = CATEGORIES.find(c => c.value === issue.category);
  const priority = PRIORITIES.find(p => p.value === issue.priority);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{category?.icon}</span>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight pr-8">
                {issue.title}
              </DialogTitle>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {issue.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant={issue.priority as any} className="capitalize">
                  {issue.priority}
                </Badge>
                <Badge variant={issue.status as any} className="capitalize">
                  {issue.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {issue.location.hostel} • Block {issue.location.block} • Room {issue.location.room}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <AttachmentGallery attachments={issue.attachments ?? []} className="mb-6" />
          <ThreadView issue={issue} onClose={onClose} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
