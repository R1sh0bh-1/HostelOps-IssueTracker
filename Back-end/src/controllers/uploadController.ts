import type { Request, Response } from 'express';
import path from 'path';
import { HttpError } from '../utils/httpError';
import { uploadOperation } from '../utils/cloudinary';

function buildBaseUrl(req: Request) {
  return `${req.protocol}://${req.get('host')}`;
}

async function fileToAttachment(req: Request, file: Express.Multer.File) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isVideo = ['.mp4', '.mov', '.avi'].includes(ext) || file.mimetype.startsWith('video/');
  const isPdf = ext === '.pdf' || file.mimetype === 'application/pdf';
  const isImage = file.mimetype.startsWith('image/');

  // Upload to Cloudinary
  const cloudinaryResponse = await uploadOperation(file.path);

  if (!cloudinaryResponse) {
    throw new HttpError(500, 'Failed to upload file to cloud storage');
  }

  return {
    id: cloudinaryResponse.public_id,
    name: file.originalname,
    type: isVideo ? ('video' as const) : isPdf ? ('pdf' as const) : ('image' as const),
    url: cloudinaryResponse.secure_url,
    thumbnail: isImage ? cloudinaryResponse.secure_url : undefined,
  };
}

export async function uploadAttachments(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!Array.isArray(files) || files.length === 0) {
    throw new HttpError(400, 'No files uploaded');
  }

  const attachments = await Promise.all(files.map(f => fileToAttachment(req, f)));
  res.json({ attachments });
}

export async function uploadProof(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    throw new HttpError(400, 'No file uploaded');
  }

  const attachment = await fileToAttachment(req, file);
  res.json({ proof: attachment });
}

export async function uploadProofs(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!Array.isArray(files) || files.length === 0) {
    throw new HttpError(400, 'No files uploaded');
  }

  const proofs = await Promise.all(files.map(f => fileToAttachment(req, f)));
  res.json({ proofs });
}

export async function uploadAvatar(req: Request, res: Response) {
  console.log('📸 Avatar upload request received');

  const file = req.file;
  if (!file) {
    console.error('❌ No file in request');
    throw new HttpError(400, 'No file uploaded');
  }

  console.log('   File received:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path
  });

  // Upload to Cloudinary
  const cloudinaryResponse = await uploadOperation(file.path);

  if (!cloudinaryResponse) {
    console.error('❌ Cloudinary upload failed for avatar');
    throw new HttpError(500, 'Failed to upload avatar to cloud storage');
  }

  console.log('✅ Avatar upload complete, sending response');

  res.json({
    avatar: {
      url: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id
    }
  });
}
