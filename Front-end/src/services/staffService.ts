import { apiFetch } from '@/utils/apiClient';

export interface Staff {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialty: 'plumbing' | 'electrical' | 'internet' | 'cleanliness' | 'furniture' | 'security' | 'other';
    hostel: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const staffService = {
    async getAllStaff(): Promise<Staff[]> {
        return await apiFetch<Staff[]>('/api/staff');
    },

    async getStaffByCategory(category: string): Promise<Staff[]> {
        return await apiFetch<Staff[]>(`/api/staff/by-category/${category}`);
    },

    async createStaff(data: {
        name: string;
        email: string;
        phone?: string;
        specialty: string;
        hostel: string;
        avatar?: string;
    }): Promise<Staff> {
        return await apiFetch<Staff>('/api/staff', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteStaff(id: string): Promise<void> {
        await apiFetch(`/api/staff/${id}`, {
            method: 'DELETE',
        });
    },
};
