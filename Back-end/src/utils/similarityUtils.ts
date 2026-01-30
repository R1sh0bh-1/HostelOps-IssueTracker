import { compareTwoStrings } from 'string-similarity';
import { IssueDoc } from '../models/Issue';

export interface SimilarIssue {
    issue: IssueDoc;
    similarityScore: number;
    matchReasons: string[];
}

const SIMILARITY_THRESHOLD = 0.7; // 70% similarity threshold

/**
 * Calculate text similarity between two strings using cosine similarity
 */
function calculateTextSimilarity(text1: string, text2: string): number {
    return compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());
}

/**
 * Calculate location similarity score
 */
function calculateLocationSimilarity(
    loc1: { hostel: string; block: string; room: string },
    loc2: { hostel: string; block: string; room: string }
): number {
    let score = 0;
    if (loc1.hostel === loc2.hostel) score += 0.4;
    if (loc1.block === loc2.block) score += 0.3;
    if (loc1.room === loc2.room) score += 0.3;
    return score;
}

/**
 * Calculate time proximity score (issues reported within 7 days get higher score)
 */
function calculateTimeProximity(date1: Date, date2: Date): number {
    const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays <= 1) return 1.0;
    if (diffInDays <= 3) return 0.7;
    if (diffInDays <= 7) return 0.4;
    return 0.1;
}

/**
 * Calculate overall similarity score between two issues
 */
export function calculateIssueSimilarity(issue1: IssueDoc, issue2: IssueDoc): {
    score: number;
    reasons: string[];
} {
    const reasons: string[] = [];
    let totalScore = 0;

    // Title similarity (weight: 30%)
    const titleSimilarity = calculateTextSimilarity(issue1.title, issue2.title);
    totalScore += titleSimilarity * 0.3;
    if (titleSimilarity > 0.7) {
        reasons.push(`Similar titles (${Math.round(titleSimilarity * 100)}% match)`);
    }

    // Description similarity (weight: 25%)
    const descSimilarity = calculateTextSimilarity(issue1.description, issue2.description);
    totalScore += descSimilarity * 0.25;
    if (descSimilarity > 0.6) {
        reasons.push(`Similar descriptions (${Math.round(descSimilarity * 100)}% match)`);
    }

    // Category match (weight: 15%)
    if (issue1.category === issue2.category) {
        totalScore += 0.15;
        reasons.push(`Same category: ${issue1.category}`);
    }

    // Location similarity (weight: 20%)
    const locationScore = calculateLocationSimilarity(issue1.location, issue2.location);
    totalScore += locationScore * 0.2;
    if (locationScore > 0.5) {
        reasons.push(`Similar location (${Math.round(locationScore * 100)}% match)`);
    }

    // Time proximity (weight: 10%)
    const timeScore = calculateTimeProximity(issue1.createdAt, issue2.createdAt);
    totalScore += timeScore * 0.1;
    if (timeScore > 0.5) {
        const diffInDays = Math.abs(issue1.createdAt.getTime() - issue2.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        reasons.push(`Reported within ${Math.ceil(diffInDays)} day(s)`);
    }

    return { score: totalScore, reasons };
}

/**
 * Find similar issues for a given issue
 */
export function findSimilarIssues(targetIssue: IssueDoc, allIssues: IssueDoc[]): SimilarIssue[] {
    const similarIssues: SimilarIssue[] = [];

    for (const issue of allIssues) {
        // Skip the target issue itself
        if (String(issue._id) === String(targetIssue._id)) continue;

        // Skip already merged issues
        if (issue.mergedInto) continue;

        // Skip if target issue is merged
        if (targetIssue.mergedInto) continue;

        // Skip resolved/closed issues (optional - can be configured)
        if (issue.status === 'closed' || issue.status === 'resolved') continue;

        const { score, reasons } = calculateIssueSimilarity(targetIssue, issue);

        if (score >= SIMILARITY_THRESHOLD) {
            similarIssues.push({
                issue,
                similarityScore: score,
                matchReasons: reasons,
            });
        }
    }

    // Sort by similarity score (highest first)
    return similarIssues.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Find all potential duplicate groups across all issues
 */
export function findAllDuplicateGroups(allIssues: IssueDoc[]): Map<string, SimilarIssue[]> {
    const duplicateGroups = new Map<string, SimilarIssue[]>();

    // Filter out merged and closed issues
    const activeIssues = allIssues.filter(
        (issue) => !issue.mergedInto && issue.status !== 'closed' && issue.status !== 'resolved'
    );

    for (const issue of activeIssues) {
        const similar = findSimilarIssues(issue, activeIssues);
        if (similar.length > 0) {
            duplicateGroups.set(String(issue._id), similar);
        }
    }

    return duplicateGroups;
}
