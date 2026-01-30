import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                try {
                    // Parse and restore Date objects
                    return JSON.parse(saved, (key, value) =>
                        key === 'timestamp' ? new Date(value) : value
                    );
                } catch (e) {
                    console.error('Failed to parse notifications', e);
                }
            }
        }
        return [];
    });

    const { socket } = useSocket();

    // Persist to local storage whenever notifications change
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Listen for socket events
    useEffect(() => {
        if (!socket) return;

        const handleIssueCreated = (issue: any) => {
            addNotification({
                type: issue.priority === 'emergency' ? 'warning' : 'info',
                title: 'New Issue Reported',
                message: issue.title,
            });
        };

        const handleIssueUpdated = (issue: any) => {
            if (issue.status === 'resolved' || issue.status === 'closed') {
                addNotification({
                    type: 'success',
                    title: 'Issue Resolved',
                    message: issue.title,
                });
            }
        };

        const handleLostFoundCreated = (item: any) => {
            addNotification({
                type: 'info',
                title: item.kind === 'lost' ? 'New Lost Item' : 'New Found Item',
                message: item.name,
            });
        };

        const handleLostFoundUpdated = (item: any) => {
            if (item.isResolved) {
                addNotification({
                    type: 'success',
                    title: 'Lost & Found Resolved',
                    message: item.name,
                });
            }
        };

        const handleAnnouncementCreated = (announcement: any) => {
            addNotification({
                type: 'info',
                title: 'New Announcement',
                message: announcement.title,
            });
        };

        socket.on('issue:created', handleIssueCreated);
        socket.on('issue:updated', handleIssueUpdated);
        socket.on('lostfound:created', handleLostFoundCreated);
        socket.on('lostfound:updated', handleLostFoundUpdated);
        socket.on('announcement:created', handleAnnouncementCreated);

        return () => {
            socket.off('issue:created', handleIssueCreated);
            socket.off('issue:updated', handleIssueUpdated);
            socket.off('lostfound:created', handleLostFoundCreated);
            socket.off('lostfound:updated', handleLostFoundUpdated);
            socket.off('announcement:created', handleAnnouncementCreated);
        };
    }, [socket]);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep last 100
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
