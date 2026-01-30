import { Issue, IssueFormData } from '@/types/issue';
import type { Status } from '@/utils/constants';
import { apiFetch } from '@/utils/apiClient';

function mapIssue(raw: any): Issue {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    resolvedAt: raw.resolvedAt ? new Date(raw.resolvedAt) : undefined,
    adminRemark: raw.adminRemark
      ? {
        ...raw.adminRemark,
        addedAt: raw.adminRemark.addedAt ? new Date(raw.adminRemark.addedAt) : new Date(),
      }
      : undefined,
  };
}

export const issueService = {
  // Fetch all issues
  async getIssues(): Promise<Issue[]> {
    const data = await apiFetch<any[]>('/api/issues');
    return data.map(mapIssue);
  },

  // Fetch single issue
  async getIssue(id: string): Promise<Issue | undefined> {
    const data = await apiFetch<any>(`/api/issues/${id}`);
    return data ? mapIssue(data) : undefined;
  },

  // Create new issue
  async createIssue(data: IssueFormData, userId: string): Promise<Issue> {
    // Upload attachments first (if any), then send metadata
    let attachments: any[] = [];
    if (data.attachments && data.attachments.length > 0) {
      const form = new FormData();
      data.attachments.forEach(file => form.append('attachments', file));
      const uploaded = await apiFetch<{ attachments: any[] }>('/api/upload/attachments', {
        method: 'POST',
        body: form,
      });
      attachments = uploaded.attachments ?? [];
    }

    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      attachments,
    };

    const created = await apiFetch<any>('/api/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Check if issue was auto-merged
    if (created.autoMerged) {
      // Show notification about auto-merge
      const similarityPercent = Math.round(created.similarityScore * 100);
      console.log(`✨ Issue auto-merged! ${similarityPercent}% similar to existing issue #${created.id}`);
      console.log('Match reasons:', created.matchReasons);
    }

    return mapIssue(created);
  },

  // Update issue status
  async updateStatus(id: string, status: Status): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return mapIssue(updated);
  },

  // Add/update admin remark (management/warden only)
  async addAdminRemark(id: string, remark: string): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/admin-remark`, {
      method: 'PATCH',
      body: JSON.stringify({ remark }),
    });
    return mapIssue(updated);
  },

  // Delete issue (management/warden only)
  async deleteIssue(id: string): Promise<void> {
    await apiFetch(`/api/issues/${id}`, {
      method: 'DELETE',
    });
  },

  // Attach resolution proof (management/warden only)
  async setResolutionProof(id: string, proofs: any[], remark?: string): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/resolution-proof`, {
      method: 'PATCH',
      body: JSON.stringify({ proofs, remark }),
    });
    return mapIssue(updated);
  },

  // Reopen a resolved issue (student only, must be reporter)
  async reopenIssue(id: string): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/reopen`, {
      method: 'POST',
    });
    return mapIssue(updated);
  },

  // Assign issue to staff (management/warden only)
  async assignIssue(id: string, staffId: string): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId }),
    });
    return mapIssue(updated);
  },

  // Find similar/duplicate issues
  async findSimilarIssues(id: string): Promise<import('@/types/issue').SimilarIssue[]> {
    const data = await apiFetch<any[]>(`/api/issues/${id}/similar`);
    return data.map((s) => ({
      issue: mapIssue(s.issue),
      similarityScore: s.similarityScore,
      matchReasons: s.matchReasons,
    }));
  },

  // Merge duplicate issues into a primary issue (management/warden only)
  async mergeIssues(primaryId: string, duplicateIds: string[]): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${primaryId}/merge`, {
      method: 'POST',
      body: JSON.stringify({ duplicateIds }),
    });
    return mapIssue(updated);
  },

  // Unmerge a previously merged issue (management/warden only)
  async unmergeIssue(id: string): Promise<Issue> {
    const updated = await apiFetch<any>(`/api/issues/${id}/unmerge`, {
      method: 'POST',
    });
    return mapIssue(updated);
  },
};
