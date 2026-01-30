import { apiFetch } from '@/utils/apiClient';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  hostel: string;
  blocks: string[];
  createdBy: { id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export const announcementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    return await apiFetch<Announcement[]>('/api/announcements');
  },

  async createAnnouncement(title: string, message: string, hostel: string, blocks: string[]): Promise<Announcement> {
    return await apiFetch<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, message, hostel, blocks }),
    });
  },
};

