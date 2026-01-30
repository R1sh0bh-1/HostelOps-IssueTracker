import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadAttachments, uploadProof, uploadProofs, uploadAvatar } from '../controllers/uploadController';

export const uploadRouter = Router();

uploadRouter.post('/attachments', requireAuth, upload.array('attachments', 5), uploadAttachments);
uploadRouter.post('/proof', requireAuth, upload.single('proof'), uploadProof);
uploadRouter.post('/proofs', requireAuth, upload.array('proofs', 5), uploadProofs);
uploadRouter.post('/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

