import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { announcementService, type Announcement } from '@/services/announcementService';

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await announcementService.getAnnouncements();
        if (alive) setAnnouncements(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          announcements.slice(0, 5).map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-lg border p-3"
            >
              <p className="font-medium text-foreground">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString()}
              </p>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

