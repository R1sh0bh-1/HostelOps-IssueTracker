import { z } from 'zod';
import { LostFoundItemModel } from '../models/LostFoundItem';
import { UserModel } from '../models/User';
import { HttpError } from '../utils/httpError';

const createLostFoundSchema = z.object({
  kind: z.enum(['lost', 'found']).optional().default('found'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  foundLocation: z.string().trim().min(1).max(200),
  photo: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      type: z.enum(['image', 'video', 'pdf']),
      url: z.string().min(1),
      thumbnail: z.string().optional(),
    })
    .optional(),
});

const requestClaimSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'claimed', 'rejected']),
});

const resolveLostFoundSchema = z.object({
  resolved: z.coerce.boolean(),
});

export async function getLostFoundItems(_req: any, res: any) {
  const items = await LostFoundItemModel.find().sort({ createdAt: -1 }).limit(200);
  res.json(items.map(i => i.toJSON()));
}

export async function createLostFoundItem(req: any, res: any) {
  const data = createLostFoundSchema.parse(req.body);

  const created = await LostFoundItemModel.create({
    kind: data.kind,
    name: data.name,
    description: data.description,
    foundLocation: data.foundLocation,
    status: 'pending',
    reportedBy: { id: req.user.id, name: req.user.name, email: req.user.email },
    photo: data.photo,
  });

  const io = req.app.get('io');
  io?.emit('lostfound:created', created.toJSON());

  res.status(201).json(created.toJSON());
}

export async function requestClaim(req: any, res: any) {
  const data = requestClaimSchema.parse(req.body ?? {});
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');

  // Prevent original poster from claiming their own item
  if (item.reportedBy.id === req.user.id) {
    throw new HttpError(400, 'You cannot claim your own item');
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');

  // Format room as BlockRoom (e.g., A233)
  const formattedRoom = `${user.block}${user.room}`;

  item.claimRequest = {
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    userContact: user.phone,
    userRoom: formattedRoom,
    requestedAt: new Date(),
    note: data.note,
  };
  await item.save();

  const io = req.app.get('io');
  io?.emit('lostfound:updated', item.toJSON());

  res.json(item.toJSON());
}

export async function approveClaim(req: any, res: any) {
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');
  if (!item.claimRequest) throw new HttpError(400, 'No claim request for this item');

  item.status = 'claimed';
  item.claimedBy = {
    id: item.claimRequest.userId,
    name: item.claimRequest.userName,
    email: item.claimRequest.userEmail,
    claimedAt: new Date(),
  };
  await item.save();

  const io = req.app.get('io');
  io?.emit('lostfound:updated', item.toJSON());

  res.json(item.toJSON());
}

export async function markAsFound(req: any, res: any) {
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');

  // Only allow marking lost items as found
  if (item.kind !== 'lost') throw new HttpError(400, 'Only lost items can be marked as found');

  // Prevent original poster from marking their own item
  if (item.reportedBy.id === req.user.id) {
    throw new HttpError(400, 'You cannot mark your own item as found');
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');

  // Format room as BlockRoom
  const formattedRoom = `${user.block}${user.room}`;

  // Mark as found and store finder info
  item.status = 'claimed';
  item.claimedBy = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    claimedAt: new Date(),
  };
  item.claimRequest = {
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    userContact: user.phone,
    userRoom: formattedRoom,
    requestedAt: new Date(),
    note: 'Marked as found',
  };
  await item.save();

  const io = req.app.get('io');
  io?.emit('lostfound:updated', item.toJSON());

  res.json(item.toJSON());
}

export async function updateLostFoundStatus(req: any, res: any) {
  const { status } = updateStatusSchema.parse(req.body);
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');

  item.status = status;
  await item.save();
  res.json(item.toJSON());
}

export async function deleteLostFoundItem(req: any, res: any) {
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');
  await LostFoundItemModel.deleteOne({ _id: item._id });
  res.status(204).send();
}

export async function resolveLostFoundItem(req: any, res: any) {
  const { resolved } = resolveLostFoundSchema.parse(req.body ?? {});
  const item = await LostFoundItemModel.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Item not found');

  const isAdmin = req.user?.role === 'management' || req.user?.role === 'warden';
  const isOwner = req.user?.id === item.reportedBy?.id;
  if (!isAdmin && !isOwner) throw new HttpError(403, 'Only the original poster or admin can resolve this item');

  item.isResolved = resolved;
  if (resolved) {
    item.resolvedAt = new Date();
    item.resolvedBy = { id: req.user.id, name: req.user.name, role: req.user.role };
  } else {
    // Clear claim data when reopening
    item.resolvedAt = undefined;
    item.resolvedBy = undefined;
    item.claimRequest = undefined;
    item.claimedBy = undefined;
    item.status = 'pending';
  }
  await item.save();

  const io = req.app.get('io');
  io?.emit('lostfound:updated', item.toJSON());

  res.json(item.toJSON());
}

