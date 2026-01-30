import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { staffService, type Staff } from '@/services/staffService';
import { CATEGORIES, HOSTELS } from '@/utils/constants';

export function ManageStaffPanel() {
    const { toast } = useToast();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [hostel, setHostel] = useState('');
    const [avatar, setAvatar] = useState('');

    const loadStaff = async () => {
        setLoading(true);
        try {
            const data = await staffService.getAllStaff();
            setStaff(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load staff members',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !specialty || !hostel) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSubmitting(true);
            await staffService.createStaff({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                specialty,
                hostel,
                avatar: avatar.trim() || undefined,
            });

            toast({
                title: 'Staff Added',
                description: `${name} has been added to the team`,
            });

            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setSpecialty('');
            setHostel('');
            setAvatar('');

            await loadStaff();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add staff member',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, staffName: string) => {
        const confirmed = window.confirm(`Delete ${staffName}? This cannot be undone.`);
        if (!confirmed) return;

        try {
            await staffService.deleteStaff(id);
            toast({
                title: 'Staff Deleted',
                description: `${staffName} has been removed`,
            });
            await loadStaff();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete staff member',
                variant: 'destructive',
            });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Manage Staff</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Add Staff Form */}
                <Card className="border-0 shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Add New Staff Member
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialty">Specialty *</Label>
                                <Select value={specialty} onValueChange={setSpecialty} required>
                                    <SelectTrigger id="specialty">
                                        <SelectValue placeholder="Select specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hostel">Hostel Assignment *</Label>
                                <Select value={hostel} onValueChange={setHostel} required>
                                    <SelectTrigger id="hostel">
                                        <SelectValue placeholder="Select hostel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Hostels</SelectItem>
                                        {HOSTELS.map(h => (
                                            <SelectItem key={h.value} value={h.value}>
                                                {h.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar">Avatar URL</Label>
                                <Input
                                    id="avatar"
                                    type="url"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Staff Member
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Staff List */}
                <Card className="border-0 shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Staff Members ({staff.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                                ))}
                            </div>
                        ) : staff.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No staff members yet. Add your first staff member to get started.
                            </p>
                        ) : (
                            staff.map((member, idx) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs">
                                                {CATEGORIES.find(c => c.value === member.specialty)?.icon}{' '}
                                                {CATEGORIES.find(c => c.value === member.specialty)?.label}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{member.hostel}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(member.id, member.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
