import express from 'express';
import path from 'path';

import authRoutes from './backend/routes/authRoutes.js';
import spaceRoutes from './backend/routes/spaceRoutes.js';
import momentRoutes from './backend/routes/momentRoutes.js';
import commentRoutes from './backend/routes/commentRoutes.js';
import reactionRoutes from './backend/routes/reactionRoutes.js';
import profileRoutes from './backend/routes/profileRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import searchRoutes from './backend/routes/searchRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';

const app = express();
const PORT = 3000;

// Increase payload size limit for local photo and audio file uploads (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// REST API Endpoints (Support both /api/ prefix and stripped routes on Vercel)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/spaces', spaceRoutes);
app.use('/spaces', spaceRoutes);

app.use('/api/moments', momentRoutes);
app.use('/moments', momentRoutes);

app.use('/api/comments', commentRoutes);
app.use('/comments', commentRoutes);

app.use('/api/reactions', reactionRoutes);
app.use('/reactions', reactionRoutes);

app.use('/api/profiles', profileRoutes);
app.use('/profiles', profileRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/search', searchRoutes);
app.use('/search', searchRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Healthcheck endpoint
const healthHandler = (req, res) => {
  res.json({ status: 'ok', service: 'LifeLoop API', timestamp: new Date().toISOString() });
};
app.get('/api/health', healthHandler);
<<<<<<< HEAD
=======
app.get('/health', healthHandler);
>>>>>>> oldrepo/main

// Fallback for unmatched API requests to prevent serverless function hangs
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl || req.url}` });
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;

if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');

      const vite = await createViteServer({
        root: process.cwd(),
        server: { middlewareMode: true },
        appType: 'spa'
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌿 LifeLoop Full-Stack Server running on http://0.0.0.0:${PORT}`);
    });
  }

  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}