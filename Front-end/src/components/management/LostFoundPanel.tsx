import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { lostFoundService } from '@/services/lostFoundService';
import type { LostFoundItem } from '@/types/lostfound';

export function LostFoundPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const handleApprove = async (id: string) => {
    try {
      await lostFoundService.approveClaim(id);
      toast({ title: 'Claim Approved', description: 'Item marked as claimed.' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to approve claim', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await lostFoundService.updateStatus(id, 'rejected');
      toast({ title: 'Rejected', description: 'Item marked as rejected.' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' });
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Lost & Found</h1>
      
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Items Pending Review</CardTitle>
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
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(item.kind ?? 'found') === 'lost' ? 'Last seen at:' : 'Found at:'} {item.foundLocation}
                  </p>
                  {item.claimRequest && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Claim request from {item.claimRequest.userName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'claimed' ? 'success' : 'destructive'}>
                    {item.status}
                  </Badge>
                  {item.isResolved && <Badge variant="success">resolved</Badge>}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="View item details"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant={item.isResolved ? 'outline' : 'secondary'} onClick={() => handleToggleResolved(item)}>
                    {item.isResolved ? 'Re-open' : 'Mark resolved'}
                  </Button>
                  {item.status === 'pending' && item.claimRequest && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleApprove(item.id)} aria-label="Approve claim">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleReject(item.id)} aria-label="Reject item">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {detailsOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-card p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Lost &amp; Found Item</h2>
              <button
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedItem(null);
                }}
                className="text-sm text-muted-foreground"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{selectedItem.name}</p>
              <p className="text-muted-foreground">
                {(selectedItem.kind ?? 'found') === 'lost' ? 'Last seen at:' : 'Found at:'} {selectedItem.foundLocation}
              </p>
              {selectedItem.description && (
                <p className="text-muted-foreground">{selectedItem.description}</p>
              )}
              {selectedItem.photo?.url && (
                (selectedItem.photo.type === 'image') ? (
                  <img
                    src={selectedItem.photo.url}
                    alt={selectedItem.name}
                    className="mt-2 h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <a
                    href={selectedItem.photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-primary underline"
                  >
                    View attachment
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
