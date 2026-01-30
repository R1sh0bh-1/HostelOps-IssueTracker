import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';

export function NotificationListener() {
    const { socket } = useSocket();
    const { toast } = useToast();

    useEffect(() => {
        if (!socket) return;

        // Lost & Found notifications
        socket.on('lostfound:created', (item: any) => {
            toast({
                title: '📢 New Lost & Found Item',
                description: `${item.reportedBy?.name} posted: ${item.name}`,
            });
        });

        socket.on('lostfound:updated', (item: any) => {
            if (item.isResolved) {
                toast({
                    title: '✅ Lost & Found Resolved',
                    description: `${item.name} has been marked as resolved`,
                });
            }
        });

        // Issue notifications
        socket.on('issue:created', (issue: any) => {
            toast({
                title: '📢 New Issue Reported',
                description: `${issue.reportedBy?.name}: ${issue.title}`,
            });
        });

        socket.on('issue:updated', (issue: any) => {
            if (issue.status === 'resolved') {
                toast({
                    title: '✅ Issue Resolved',
                    description: `${issue.title} has been resolved`,
                });
            }
        });

        return () => {
            socket.off('lostfound:created');
            socket.off('lostfound:updated');
            socket.off('issue:created');
            socket.off('issue:updated');
        };
    }, [socket, toast]);

    return null;
}
