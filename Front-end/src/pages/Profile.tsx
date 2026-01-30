import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Home,
  Building,
  DoorOpen,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Phone,
  Bell,
  Lock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { AvatarCropDialog } from '@/components/AvatarCropDialog';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  const handleSave = () => {
    if (editedName.trim()) {
      updateProfile({ name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create object URL for cropping
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCropDialogOpen(true);
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', croppedImage, 'avatar.jpg');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      const data = await response.json();
      const avatarUrl = data.avatar?.url;

      if (avatarUrl) {
        await updateProfile({ avatar: avatarUrl });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploadingAvatar(false);
      // Clean up object URL
      URL.revokeObjectURL(imageToCrop);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatar: '' });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'management':
      case 'warden':
        return 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md';
      case 'maintenance':
        return 'bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-md';
      default:
        return 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground';
    }
  };

  // Mock stats data
  const stats = {
    issuesReported: 12,
    issuesResolved: 9,
    avgResponseTime: '2.5 hrs',
    satisfactionRate: 94,
  };

  const profileFields = [
    { icon: Mail, label: 'Email', value: user?.email, editable: false },
    { icon: Home, label: 'Hostel', value: user?.hostel, editable: false },
    { icon: Building, label: 'Block', value: user?.block ? `Block ${user.block}` : 'N/A', editable: false },
    { icon: DoorOpen, label: 'Room Number', value: user?.room, editable: false },
    { icon: Phone, label: 'Phone', value: user?.phone || 'Not set', editable: true },
    { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', editable: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl space-y-6"
      >
        {/* Hero Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg overflow-hidden relative">
            {/* Gradient Header Background */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
            <div className="absolute inset-x-0 top-0 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0yMEgtMTB6IiBmaWxsLW9wYWNpdHk9Ii4wNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />

            <CardContent className="pt-20 pb-6 relative">
              <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
                {/* Avatar with Edit Button */}
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-4 ring-primary/20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-primary-foreground">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {user?.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute bottom-1 left-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Name & Role */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-10 max-w-xs text-lg font-semibold bg-background/80 backdrop-blur-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={handleSave} className="h-9 w-9 bg-success/10 hover:bg-success/20">
                        <Save className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancel} className="h-9 w-9 bg-destructive/10 hover:bg-destructive/20">
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 sm:justify-start flex-wrap">
                    <Badge className={cn('gap-1.5 px-3 py-1', getRoleBadgeColor(user?.role || 'student'))}>
                      <Shield className="h-3.5 w-3.5" />
                      {user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) || '')}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-warning" />
                      Active Member
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-card hover-lift cursor-default">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.issuesReported}</p>
                <p className="text-xs text-muted-foreground">Issues Reported</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card hover-lift cursor-default">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-muted">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.issuesResolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card hover-lift cursor-default">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning-muted">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.avgResponseTime}</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card hover-lift cursor-default">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-foreground">{stats.satisfactionRate}%</p>
                </div>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Profile Details - Takes 3 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="border-0 shadow-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your personal and hostel details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileFields.map((field, index) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 rounded-xl bg-muted/40 p-4 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
                      <field.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{field.label}</Label>
                      <p className="font-medium text-foreground truncate">{field.value || 'Not set'}</p>
                    </div>
                    {field.editable && (
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Panel - Takes 2 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Notifications Settings */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get instant alerts</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity Progress */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Resolution Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issues Resolved</span>
                    <span className="font-semibold text-foreground">{stats.issuesResolved}/{stats.issuesReported}</span>
                  </div>
                  <Progress value={(stats.issuesResolved / stats.issuesReported) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.issuesResolved / stats.issuesReported) * 100)}% of your reported issues have been resolved
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-between hover:bg-muted/50 text-destructive hover:text-destructive">
                  <span className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Delete Account
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </AppLayout>
  );
};

export default Profile;
