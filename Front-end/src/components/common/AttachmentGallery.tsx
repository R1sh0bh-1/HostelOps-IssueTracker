import { FileText, ExternalLink, Video } from 'lucide-react';
import { Attachment } from '@/types/issue';
import { cn } from '@/lib/utils';

export function AttachmentGallery({ attachments, className }: { attachments: Attachment[]; className?: string }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-foreground">Attachments</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attachments.map((a) => {
          if (a.type === 'image') {
            return (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-lg border bg-background"
                title={a.name}
              >
                <img
                  src={a.thumbnail || a.url}
                  alt={a.name}
                  className="h-40 w-full object-cover transition-transform group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-muted-foreground">{a.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </a>
            );
          }

          if (a.type === 'video') {
            return (
              <div key={a.id} className="overflow-hidden rounded-lg border bg-background">
                <video className="h-40 w-full bg-black object-cover" controls preload="metadata" src={a.url} />
                <div className="flex items-center gap-2 p-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground">{a.name}</span>
                </div>
              </div>
            );
          }

          // pdf or unknown fallback
          return (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 hover:bg-muted/30"
              title={a.name}
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-sm text-foreground">{a.name}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

