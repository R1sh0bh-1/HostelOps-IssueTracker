import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image as ImageIcon } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { lostFoundService } from '@/services/lostFoundService';
import type { LostFoundItem } from '@/types/lostfound';
import { apiFetch } from '@/utils/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';

export default function LostFound() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [kind, setKind] = useState<'found' | 'lost'>('found');
  const [name, setName] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await lostFoundService.getItems());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('lostfound:created', (newItem: any) => {
      setItems(prev => [newItem, ...prev]);
    });

    socket.on('lostfound:updated', (updatedItem: any) => {
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    });

    return () => {
      socket.off('lostfound:created');
      socket.off('lostfound:updated');
    };
  }, [socket]);

  const statusLabel = useMemo(() => {
    return (status: LostFoundItem['status']) =>
      status === 'pending' ? 'pending' : status === 'claimed' ? 'claimed' : 'rejected';
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !foundLocation.trim()) return;
    try {
      let uploadedPhoto: any | undefined = undefined;
      if (photo) {
        const form = new FormData();
        form.append('attachments', photo);
        const uploaded = await apiFetch<{ attachments: any[] }>('/api/upload/attachments', {
          method: 'POST',
          body: form,
        });
        uploadedPhoto = uploaded.attachments?.[0];
      }

      await lostFoundService.createItem({
        kind,
        name: name.trim(),
        foundLocation: foundLocation.trim(),
        description: description.trim() ? description.trim() : undefined,
        photo: uploadedPhoto,
      });

      toast({ title: 'Posted', description: 'Your Lost & Found item is now visible.' });
      setOpen(false);
      setKind('found');
      setName('');
      setFoundLocation('');
      setDescription('');
      setPhoto(null);
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to post item', variant: 'destructive' });
    }
  };

  const handleToggleResolved = async (item: LostFoundItem) => {
    try {
      await lostFoundService.resolveItem(item.id, !item.isResolved);
      toast({
        title: item.isResolved ? 'Re-opened' : 'Resolved',
        description: item.isResolved ? 'Item marked as active again.' : 'Item marked as resolved.',
      });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to update resolve status', variant: 'destructive' });
    }
  };

  const handleRequestClaim = async (item: LostFoundItem) => {
    try {
      await lostFoundService.requestClaim(item.id);
      toast({ title: 'Request sent', description: 'Admin will review your claim request.' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to request claim', variant: 'destructive' });
    }
  };

  const handleMarkAsFound = async (item: LostFoundItem) => {
    try {
      await lostFoundService.markAsFound(item.id);
      toast({ title: 'Item marked as found' });
      load();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to mark as found', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Lost &amp; Found</h1>
          <Button variant="gradient" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Post Item
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{kind === 'found' ? 'Post a Found Item' : 'Report a Lost Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={kind === 'found' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setKind('found')}
                >
                  Found
                </Button>
                <Button
                  type="button"
                  variant={kind === 'lost' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setKind('lost')}
                >
                  Lost
                </Button>
              </div>
              <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                placeholder={kind === 'found' ? 'Found location (e.g., Library)' : 'Last seen location (e.g., Library)'}
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
              />
              <Textarea placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  {photo ? photo.name : 'Add a photo (optional)'}
                </div>
                <Input
                  type="file"
                  accept="image/*,application/pdf,video/*"
                  className="max-w-[220px]"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim() || !foundLocation.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <Badge variant={item.kind === 'lost' ? 'destructive' : 'default'}>
                          {item.kind === 'lost' ? 'Lost' : 'Found'}
                        </Badge>
                        {!item.isResolved && (
                          <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'claimed' ? 'success' : 'destructive'}>
                            {statusLabel(item.status)}
                          </Badge>
                        )}
                        {item.isResolved && (
                          <Badge variant="success">
                            resolved
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.kind === 'lost' ? 'Last seen at:' : 'Found at:'} {item.foundLocation}
                      </p>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                      {item.photo?.url && (
                        item.photo.type === 'image' ? (
                          <img
                            src={item.photo.url}
                            alt={item.name}
                            className="mt-3 h-32 w-full max-w-md rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage({ url: item.photo!.url, name: item.name })}
                          />
                        ) : (
                          <a className="mt-3 inline-block text-sm text-primary underline" href={item.photo.url} target="_blank" rel="noreferrer">
                            View attachment
                          </a>
                        )
                      )}
                      {item.claimRequest && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>Claim requested by {item.claimRequest.userName} • {new Date(item.claimRequest.requestedAt).toLocaleString()}</p>
                          {item.claimRequest.userContact && <p>Contact: {item.claimRequest.userContact}</p>}
                          {item.claimRequest.userRoom && <p>Room: {item.claimRequest.userRoom}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {(user?.role === 'management' || user?.role === 'warden' || user?.id === item.reportedBy.id) && (
                        <Button
                          variant={item.isResolved ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleResolved(item)}
                        >
                          {item.isResolved ? 'Re-open' : 'Mark resolved'}
                        </Button>
                      )}
                      {(item.kind ?? 'found') === 'found' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!!item.claimRequest || item.status !== 'pending' || user?.id === item.reportedBy.id}
                          onClick={() => handleRequestClaim(item)}
                        >
                          Request claim
                        </Button>
                      )}
                      {item.kind === 'lost' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={item.status !== 'pending' || user?.id === item.reportedBy.id}
                          onClick={() => handleMarkAsFound(item)}
                        >
                          Found
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ImagePreviewDialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        imageName={previewImage?.name || ''}
      />
    </AppLayout>
  );
}

