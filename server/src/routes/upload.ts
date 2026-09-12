import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { uploadsDir } from '../utils/uploadsDir';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_TYPES.has(file.mimetype)),
});

const router = Router();

router.post('/', requireAuth, upload.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No valid image uploaded (jpeg/png/gif/webp, max 8MB)' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
