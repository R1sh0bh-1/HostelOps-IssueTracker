import { apiFetch } from '@/utils/apiClient';
import type { LostFoundItem, LostFoundStatus } from '@/types/lostfound';

export const lostFoundService = {
  async getItems(): Promise<LostFoundItem[]> {
    return await apiFetch<LostFoundItem[]>('/api/lostfound');
  },

  async createItem(params: {
    kind?: 'lost' | 'found';
    name: string;
    description?: string;
    foundLocation: string;
    photo?: any;
  }): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>('/api/lostfound', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async requestClaim(id: string, note?: string): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>(`/api/lostfound/${id}/claim`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },

  async approveClaim(id: string): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>(`/api/lostfound/${id}/approve-claim`, {
      method: 'PATCH',
    });
  },

  async updateStatus(id: string, status: LostFoundStatus): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>(`/api/lostfound/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteItem(id: string): Promise<void> {
    await apiFetch(`/api/lostfound/${id}`, { method: 'DELETE' });
  },

  async resolveItem(id: string, resolved: boolean): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>(`/api/lostfound/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolved }),
    });
  },

  async markAsFound(id: string): Promise<LostFoundItem> {
    return await apiFetch<LostFoundItem>(`/api/lostfound/${id}/mark-found`, {
      method: 'PATCH',
    });
  },
};

