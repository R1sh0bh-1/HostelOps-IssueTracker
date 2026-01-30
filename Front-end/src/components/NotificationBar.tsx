import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

export function NotificationBar() {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const [visible, setVisible] = useState<string[]>([]);

    // Auto-show new notifications
    useEffect(() => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length > 0) {
            const latest = unread[0];
            if (!visible.includes(latest.id)) {
                setVisible(prev => [...prev, latest.id]);

                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    setVisible(prev => prev.filter(id => id !== latest.id));
                    markAsRead(latest.id);
                }, 5000);
            }
        }
    }, [notifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-success" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-destructive" />;
            default:
                return <Info className="h-5 w-5 text-primary" />;
        }
    };

    const visibleNotifications = notifications.filter(n => visible.includes(n.id));

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-80">
            <AnimatePresence>
                {visibleNotifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 300, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.8 }}
                        className={cn(
                            'bg-card border rounded-lg shadow-lg p-4 flex gap-3',
                            !notification.read && 'border-l-4',
                            notification.type === 'success' && 'border-l-success',
                            notification.type === 'warning' && 'border-l-warning',
                            notification.type === 'error' && 'border-l-destructive',
                            notification.type === 'info' && 'border-l-primary'
                        )}
                    >
                        <div className="shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => {
                                setVisible(prev => prev.filter(id => id !== notification.id));
                                deleteNotification(notification.id);
                            }}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
