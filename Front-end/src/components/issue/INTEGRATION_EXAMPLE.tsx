// Example: How to integrate IssueDuplicateViewer into your issue detail page

import { IssueDuplicateViewer } from '@/components/issue/IssueDuplicateViewer';
import { useAuth } from '@/hooks/useAuth';

function IssueDetailPage({ issue }) {
    const { user } = useAuth();
    const isManagementOrWarden = user?.role === 'management' || user?.role === 'warden';

    return (
        <div className="space-y-6">
            {/* Existing issue details */}
            <IssueDetailsCard issue={issue} />

            {/* Duplicate Detection - Only visible to management/warden */}
            {isManagementOrWarden && (
                <IssueDuplicateViewer
                    issue={issue}
                    onMergeComplete={() => {
                        // Refresh issue list or navigate back
                        refetchIssues();
                    }}
                />
            )}

            {/* Other sections: comments, attachments, etc. */}
        </div>
    );
}

export default IssueDetailPage;
