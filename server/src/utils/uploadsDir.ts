import path from 'path';
import fs from 'fs';

// Railway's filesystem is ephemeral by default — uploads vanish on redeploy
// unless UPLOADS_DIR points at a mounted volume.
export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '../../uploads');

fs.mkdirSync(uploadsDir, { recursive: true });
