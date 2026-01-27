import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrate.js';
import { documentRoutes } from './routes/documents.js';
import { blockRoutes } from './routes/blocks.js';
import { uploadRoutes, uploadsDir } from './routes/uploads.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/documents', documentRoutes);
app.use('/api', blockRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

app.use(errorHandler);

// In production, serve the built Vue client as static files
if (process.env.NODE_ENV === 'production') {
  const clientDist = join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  // SPA fallback: serve index.html for any non-API route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Initialize database and start server
runMigrations();

app.listen(PORT, () => {
  console.log(`Plectrumite server running on http://localhost:${PORT}`);
});

export default app;
