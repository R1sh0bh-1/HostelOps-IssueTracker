import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Settings,
  ChevronRight,
  Package,
  MessageSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationBar } from '@/components/NotificationBar';
import { NotificationsPanel } from '@/components/management/NotificationsPanel';

// Navigation items for students - Profile removed from here
const studentNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/report', label: 'Report Issue', icon: Plus },
  { path: '/my-issues', label: 'My Issues', icon: ClipboardList },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/lostfound', label: 'Lost & Found', icon: Package },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // Check if user is management/warden - they don't see student nav
  const isAdmin = user?.role === 'management' || user?.role === 'warden';
  const isOnManagement = location.pathname.startsWith('/management');

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to={isAdmin ? '/management' : '/dashboard'} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-md transition-transform group-hover:scale-105">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <span className="hidden font-bold text-foreground sm:block">
              HostelHub
            </span>
          </Link>

          {/* Desktop Navigation - Only show for non-management users */}
          {!isAdmin && (
            <nav className="hidden items-center gap-1 md:flex">
              {studentNavItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 transition-all duration-200',
                        isActive && 'bg-primary-muted text-primary'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {/* Notifications - Show for everyone (Student & Admin) */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotificationsPanelOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>

            {/* User Menu - Profile accessible via clicking the avatar/icon */}
            {user && (
              <div className="hidden items-center gap-3 md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 pr-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.hostel}</p>
                      </div>
                      <Avatar className="h-9 w-9 border-2 border-primary/20 transition-all hover:border-primary/50">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary-muted text-primary text-sm font-medium">
                          {getInitials(user.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </DropdownMenuItem>
                    {isAdmin && !isOnManagement && (
                      <DropdownMenuItem onClick={() => navigate('/management')} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Management Dashboard
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t bg-card md:hidden"
            >
              <nav className="container mx-auto space-y-1 p-4">
                {/* Only show student nav for non-management users */}
                {!isAdmin && studentNavItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive && 'bg-primary-muted text-primary'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}

                {user && (
                  <div className="mt-4 border-t pt-4">
                    <div
                      className="mb-3 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        navigate('/profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary-muted text-primary">
                          {getInitials(user.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Hide management link for management users - they're already there */}
                    {isAdmin && !isOnManagement && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 mb-2"
                        onClick={() => {
                          navigate('/management');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="h-5 w-5" />
                        Management Dashboard
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive hover:bg-destructive-muted hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      {/* Notifications Panel */}
      <NotificationsPanel
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />

      {/* Real-time Notification Bar */}
      <NotificationBar />
    </div>
  );
}
