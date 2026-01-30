import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  User,
  ChevronRight,
  AlertTriangle,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Armchair,
  Lock,
  FileText,
  GitMerge
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types/issue';
import { CATEGORIES, PRIORITIES, STATUSES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  index?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-4 w-4" />,
  electrical: <Zap className="h-4 w-4" />,
  cleanliness: <Sparkles className="h-4 w-4" />,
  internet: <Wifi className="h-4 w-4" />,
  furniture: <Armchair className="h-4 w-4" />,
  security: <Lock className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

export function IssueCard({ issue, onClick, index = 0 }: IssueCardProps) {
  const category = CATEGORIES.find(c => c.value === issue.category);
  const priority = PRIORITIES.find(p => p.value === issue.priority);
  const status = STATUSES.find(s => s.value === issue.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card
        className={cn(
          'cursor-pointer overflow-hidden border transition-all duration-200',
          'hover:shadow-card-hover hover:border-primary/20',
          issue.priority === 'emergency' && 'border-l-4 border-l-destructive'
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`View issue: ${issue.title}`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Category Icon + Priority + Status */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className={cn(
                  'flex items-center justify-center rounded-md p-1.5',
                  'bg-primary-muted text-primary'
                )}>
                  {categoryIcons[issue.category] || <FileText className="h-4 w-4" />}
                </div>

                <Badge variant={issue.priority as any} className="text-[10px]">
                  {issue.priority === 'emergency' && (
                    <AlertTriangle className="mr-1 h-3 w-3" />
                  )}
                  {priority?.label}
                </Badge>

                <Badge variant={issue.status as any} className="text-[10px]">
                  {status?.label}
                </Badge>

                {/* Merged Issues Indicators */}
                {issue.mergedIssues && issue.mergedIssues.length > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    🔗 {issue.mergedIssues.length} merged
                  </Badge>
                )}
                {issue.mergedInto && (
                  <Badge variant="outline" className="text-[10px] bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                    ↗️ Duplicate
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-1.5 text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {issue.title}
              </h3>

              {/* Description Preview */}
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {issue.description}
              </p>

              {/* Admin Remark (visible to reporter/users) */}
              {issue.adminRemark?.content && (
                <div className="mb-3 rounded-md border bg-muted/30 p-2 text-xs">
                  <p className="font-medium text-foreground">Admin remark</p>
                  <p className="mt-0.5 text-muted-foreground line-clamp-2">
                    {issue.adminRemark.content}
                  </p>
                </div>
              )}

              {/* Assigned Staff (visible to reporter/users) */}
              {issue.assignedTo && (
                <div className="mb-3 rounded-md border bg-primary/5 border-primary/20 p-2.5 text-xs">
                  <p className="font-medium text-foreground mb-1">👤 Assigned to Staff</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">{issue.assignedTo.name}</p>
                      {issue.assignedTo.phone && (
                        <p className="text-muted-foreground mt-0.5">
                          📞 {issue.assignedTo.phone}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {status?.label}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {issue.location.hostel}, Block {issue.location.block}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {issue.reportedBy.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Right: Arrow */}
            <div className="flex items-center">
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
