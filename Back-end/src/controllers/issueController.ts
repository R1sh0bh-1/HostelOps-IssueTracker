import { z } from 'zod';
import { IssueModel } from '../models/Issue';
import { HttpError } from '../utils/httpError';
import { ThreadModel } from '../models/Thread';
import { StaffModel } from '../models/Staff';
import { findSimilarIssues } from '../utils/similarityUtils';

const createIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['plumbing', 'electrical', 'internet', 'cleanliness', 'furniture', 'security', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  // Frontend sends File[] today (mock) — for now accept attachments as empty or array of already-uploaded metadata
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['image', 'video', 'pdf']),
        url: z.string().url(),
        thumbnail: z.string().url().optional(),
      })
    )
    .optional()
    .default([]),
  location: z
    .object({
      hostel: z.string().min(1),
      block: z.string().min(1),
      room: z.string().min(1),
    })
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['reported', 'assigned', 'in-progress', 'resolved', 'closed']),
});

const addAdminRemarkSchema = z.object({
  remark: z.string().trim().min(1),
});

const setResolutionProofSchema = z.object({
  proofs: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['image', 'video', 'pdf']),
    url: z.string().min(1),
    thumbnail: z.string().optional(),
  })).min(1, 'At least one proof file is required'),
  remark: z.string().trim().optional(),
});

export async function getIssues(req: any, res: any) {
  const includeMerged = req.query.includeMerged === 'true';
  const filter = includeMerged ? {} : { mergedInto: { $exists: false } };
  const issues = await IssueModel.find(filter).sort({ createdAt: -1 });
  res.json(issues.map(i => i.toJSON()));
}

export async function getIssue(req: any, res: any) {
  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');
  res.json(issue.toJSON());
}

export async function createIssue(req: any, res: any) {
  const data = createIssueSchema.parse(req.body);

  const issue = await IssueModel.create({
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: 'reported',
    location: data.location ?? { hostel: req.user.hostel ?? 'Boys Hostel A', block: req.user.block ?? 'B', room: req.user.room ?? 'Unknown' },
    reportedBy: { id: req.user.id, name: req.user.name, email: req.user.email },
    attachments: data.attachments,
  });

  // Automatically check for duplicates and merge if similarity > 80%
  const allIssues = await IssueModel.find({ mergedInto: { $exists: false }, status: { $in: ['reported', 'assigned', 'in-progress'] } });
  const similarIssues = findSimilarIssues(issue, allIssues);

  // Auto-merge if we find a very similar issue (>80% similarity)
  const highSimilarityIssue = similarIssues.find((s) => s.similarityScore >= 0.8);

  if (highSimilarityIssue) {
    // Merge the new issue into the existing similar issue
    issue.mergedInto = String(highSimilarityIssue.issue._id);
    await issue.save();

    // Update the primary issue
    const primaryIssue = highSimilarityIssue.issue;
    primaryIssue.mergedIssues = primaryIssue.mergedIssues || [];
    primaryIssue.mergedIssues.push(String(issue._id));
    await primaryIssue.save();

    const io = req.app.get('io');
    io?.emit('issue:auto-merged', {
      newIssue: issue.toJSON(),
      primaryIssue: primaryIssue.toJSON(),
      similarityScore: highSimilarityIssue.similarityScore,
      matchReasons: highSimilarityIssue.matchReasons,
    });

    // Return the primary issue instead
    return res.status(201).json({
      ...primaryIssue.toJSON(),
      autoMerged: true,
      mergedNewIssue: issue.toJSON(),
      similarityScore: highSimilarityIssue.similarityScore,
      matchReasons: highSimilarityIssue.matchReasons,
    });
  }

  const io = req.app.get('io');
  io?.emit('issue:created', issue.toJSON());

  res.status(201).json(issue.toJSON());
}

export async function updateIssueStatus(req: any, res: any) {
  const { status } = updateStatusSchema.parse(req.body);
  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  // Enforce proof requirement when marking as resolved
  if (status === 'resolved') {
    if (!issue.resolutionProofs || issue.resolutionProofs.length === 0) {
      throw new HttpError(400, 'Cannot mark issue as resolved without uploading at least one proof file');
    }
    issue.resolvedAt = new Date();
    // Set resolvedBy if not already set
    if (!issue.resolvedBy) {
      issue.resolvedBy = { id: req.user.id, name: req.user.name };
    }
  }

  issue.status = status;
  if (status !== 'resolved') {
    issue.resolvedAt = undefined;
    issue.resolvedBy = undefined;
  }
  await issue.save();

  const io = req.app.get('io');
  io?.emit('issue:updated', issue.toJSON());

  res.json(issue.toJSON());
}

export async function addAdminRemark(req: any, res: any) {
  const { remark } = addAdminRemarkSchema.parse(req.body);

  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  issue.adminRemark = {
    content: remark,
    addedBy: { id: req.user.id, name: req.user.name },
    addedAt: new Date(),
  };
  await issue.save();

  res.json(issue.toJSON());
}

export async function deleteIssue(req: any, res: any) {
  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  // Clean up associated thread if it exists
  await ThreadModel.deleteOne({ issueId: String(req.params.id) });

  await IssueModel.deleteOne({ _id: issue._id });
  res.status(204).send();
}

export async function setResolutionProof(req: any, res: any) {
  const { proofs, remark } = setResolutionProofSchema.parse(req.body);

  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  // Add uploadedAt timestamp to each proof
  const proofsWithTimestamp = proofs.map(proof => ({
    ...proof,
    uploadedAt: new Date(),
  }));

  issue.resolutionProofs = proofsWithTimestamp;
  if (typeof remark === 'string' && remark.trim()) {
    issue.resolutionRemark = remark.trim();
  }
  await issue.save();

  res.json(issue.toJSON());
}

const assignIssueSchema = z.object({
  staffId: z.string().min(1),
});

export async function assignIssue(req: any, res: any) {
  const { staffId } = assignIssueSchema.parse(req.body);

  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  const staff = await StaffModel.findById(staffId);
  if (!staff || !staff.isActive) throw new HttpError(404, 'Staff member not found');

  issue.assignedTo = {
    id: String(staff._id),
    name: staff.name,
    phone: staff.phone,
  };
  issue.status = 'assigned';
  await issue.save();

  const io = req.app.get('io');
  io?.emit('issue:updated', issue.toJSON());

  res.json(issue.toJSON());
}

/**
 * Find similar issues for a given issue
 */
export async function findSimilar(req: any, res: any) {
  const targetIssue = await IssueModel.findById(req.params.id);
  if (!targetIssue) throw new HttpError(404, 'Issue not found');

  const allIssues = await IssueModel.find();
  const similarIssues = findSimilarIssues(targetIssue, allIssues);

  res.json(
    similarIssues.map((s) => ({
      issue: s.issue.toJSON(),
      similarityScore: s.similarityScore,
      matchReasons: s.matchReasons,
    }))
  );
}

const mergeIssuesSchema = z.object({
  duplicateIds: z.array(z.string().min(1)).min(1),
});

/**
 * Merge duplicate issues into a primary issue
 */
export async function mergeIssues(req: any, res: any) {
  const { duplicateIds } = mergeIssuesSchema.parse(req.body);
  const primaryId = req.params.id;

  const primaryIssue = await IssueModel.findById(primaryId);
  if (!primaryIssue) throw new HttpError(404, 'Primary issue not found');

  // Validate all duplicate issues exist and are not already merged
  const duplicateIssues = await IssueModel.find({ _id: { $in: duplicateIds } });
  if (duplicateIssues.length !== duplicateIds.length) {
    throw new HttpError(400, 'One or more duplicate issues not found');
  }

  for (const dup of duplicateIssues) {
    if (dup.mergedInto) {
      throw new HttpError(400, `Issue ${dup._id} is already merged into another issue`);
    }
    if (String(dup._id) === primaryId) {
      throw new HttpError(400, 'Cannot merge an issue into itself');
    }
  }

  // Mark duplicates as merged
  for (const dup of duplicateIssues) {
    dup.mergedInto = primaryId;
    await dup.save();
  }

  // Update primary issue with merged issue IDs
  primaryIssue.mergedIssues = primaryIssue.mergedIssues || [];
  primaryIssue.mergedIssues.push(...duplicateIds);
  await primaryIssue.save();

  const io = req.app.get('io');
  io?.emit('issue:merged', {
    primaryIssue: primaryIssue.toJSON(),
    mergedIssueIds: duplicateIds,
  });

  res.json(primaryIssue.toJSON());
}

/**
 * Unmerge a previously merged issue
 */
export async function unmergeIssue(req: any, res: any) {
  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  if (!issue.mergedInto) {
    throw new HttpError(400, 'Issue is not merged');
  }

  const primaryIssueId = issue.mergedInto;
  const primaryIssue = await IssueModel.findById(primaryIssueId);

  // Remove from primary issue's merged list
  if (primaryIssue && primaryIssue.mergedIssues) {
    primaryIssue.mergedIssues = primaryIssue.mergedIssues.filter((id) => id !== String(issue._id));
    await primaryIssue.save();
  }

  // Clear mergedInto field
  issue.mergedInto = undefined;
  await issue.save();

  const io = req.app.get('io');
  io?.emit('issue:unmerged', {
    issue: issue.toJSON(),
    primaryIssueId,
  });

  res.json(issue.toJSON());
}

/**
 * Reopen a resolved issue (student only, must be the reporter)
 */
export async function reopenIssue(req: any, res: any) {
  const issue = await IssueModel.findById(req.params.id);
  if (!issue) throw new HttpError(404, 'Issue not found');

  if (issue.status !== 'resolved') {
    throw new HttpError(400, 'Only resolved issues can be reopened');
  }

  // Only the student who reported the issue can reopen it
  if (issue.reportedBy.id !== req.user.id) {
    throw new HttpError(403, 'Only the student who reported this issue can reopen it');
  }

  issue.status = 'reported';
  issue.resolvedAt = undefined;
  issue.resolvedBy = undefined;
  await issue.save();

  const io = req.app.get('io');
  io?.emit('issue:reopened', issue.toJSON());

  res.json(issue.toJSON());
}
