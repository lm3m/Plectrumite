import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrate.js';
import { documentRoutes } from './routes/documents.js';
import { blockRoutes } from './routes/blocks.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/documents', documentRoutes);
app.use('/api', blockRoutes);

app.use(errorHandler);

// Initialize database and start server
runMigrations();

app.listen(PORT, () => {
  console.log(`Plectrumite server running on http://localhost:${PORT}`);
});

export default app;
