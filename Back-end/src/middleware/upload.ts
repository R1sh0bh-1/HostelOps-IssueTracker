import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Use process.cwd() so dev (ts-node) and prod (compiled) agree on the same folder.
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const safeField = (file.fieldname || 'file').replace(/[^a-z0-9_-]/gi, '');
    cb(null, `${safeField}-${uniqueSuffix}${ext}`);
  },
});

const allowedExt = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.pdf']);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const okMime =
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/pdf';

  if (allowedExt.has(ext) && okMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

