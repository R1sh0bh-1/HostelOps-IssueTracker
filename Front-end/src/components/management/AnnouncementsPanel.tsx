import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { announcementService, type Announcement } from '@/services/announcementService';
import { HOSTELS, BLOCKS } from '@/utils/constants';

export function AnnouncementsPanel() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [hostel, setHostel] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlockToggle = (block: string) => {
    setSelectedBlocks(prev =>
      prev.includes(block)
        ? prev.filter(b => b !== block)
        : [...prev, block]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim() || !hostel || selectedBlocks.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields and select at least one block',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSending(true);
      await announcementService.createAnnouncement(title.trim(), message.trim(), hostel, selectedBlocks);
      toast({
        title: 'Announcement sent',
        description: `Visible to ${hostel}, Blocks: ${selectedBlocks.join(', ')}`
      });
      setTitle('');
      setMessage('');
      setHostel('');
      setSelectedBlocks([]);
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to send announcement', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Announcements</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            {/* Hostel Selection */}
            <div className="space-y-2">
              <Label>Target Hostel</Label>
              <Select value={hostel} onValueChange={setHostel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hostel" />
                </SelectTrigger>
                <SelectContent>
                  {HOSTELS.map(h => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Block Selection */}
            <div className="space-y-2">
              <Label>Target Blocks</Label>
              <div className="flex flex-wrap gap-4">
                {BLOCKS.map(block => (
                  <div key={block} className="flex items-center space-x-2">
                    <Checkbox
                      id={`block-${block}`}
                      checked={selectedBlocks.includes(block)}
                      onCheckedChange={() => handleBlockToggle(block)}
                    />
                    <Label
                      htmlFor={`block-${block}`}
                      className="cursor-pointer font-normal"
                    >
                      Block {block}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full gap-2" disabled={sending}>
              <Send className="h-4 w-4" /> Send Announcement
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
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
              announcements.slice(0, 10).map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-primary/10 px-2 py-0.5">
                      {HOSTELS.find(h => h.value === a.hostel)?.label || a.hostel}
                    </span>
                    <span className="rounded bg-secondary/10 px-2 py-0.5">
                      Blocks: {a.blocks.join(', ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
