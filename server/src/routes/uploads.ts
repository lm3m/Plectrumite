import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const uploadsDir = join(__dirname, '..', '..', 'data', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

const DOMPurify = createDOMPurify(new JSDOM('').window);

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (Object.prototype.hasOwnProperty.call(MIME_EXTENSIONS, file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, WebP, and SVG images are allowed'));
    }
  },
});

const router = Router();

router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large (max 10 MB)' });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const ext = MIME_EXTENSIONS[req.file.mimetype];
    const filename = `${randomUUID()}${ext}`;
    let contents = req.file.buffer;
    if (req.file.mimetype === 'image/svg+xml') {
      const sanitized = DOMPurify.sanitize(contents.toString('utf-8'), {
        USE_PROFILES: { svg: true, svgFilters: true },
      });
      contents = Buffer.from(sanitized, 'utf-8');
    }
    writeFileSync(join(uploadsDir, filename), contents);

    res.status(201).json({
      url: `/uploads/${filename}`,
      filename,
    });
  });
});

export { router as uploadRoutes };
