import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import clientRoutes from './routes/client.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    console.log('[App] Starting RugSimple API...');
    console.log('[ENV] NODE_ENV:', process.env.NODE_ENV);
    console.log('[ENV] PORT:', PORT);

    await connectDB();
    console.log('[DB] Connected');

    // Application routes
    app.use('/api', authRoutes);
    app.use('/api', clientRoutes);
    app.use('/api', dataRoutes);
    app.use('/admin', adminRoutes);

    // Health check route (used by App Runner)
    app.get('/health-check', (req, res) => res.status(200).json({ status: 'ok' }));

    // Root path
    app.get('/', (req, res) => res.send(`Welcome to RugSimple ${process.env.NODE_ENV || ''} API`));

    // Route fallbacks
    app.use('/api/*', (req, res) => res.status(404).json({ error: 'API Route Not Found' }));
    app.use('/admin/*', (req, res) => res.status(404).json({ error: 'Admin Route Not Found' }));

    // Global error handler
    app.use((err, req, res, _next) => {
      console.error('[ERROR]', err);
      if (err.name === 'MongoServerError' && err.code === 11000)
        return res
          .status(409)
          .json({ error: 'Duplicate key error', details: err.keyValue || err.message });
      if (err.name === 'ValidationError')
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
      res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
    });

    // Catch-all 404
    app.use((req, res) => {
      console.warn('[404 Not Found]', req.method, req.originalUrl);
      res.status(404).json({ error: 'Route Not Found' });
    });

    app.listen(PORT, () => console.log(`[App] Listening on port ${PORT}`));
  } catch (err) {
    console.error('[Startup Error]', err);
    process.exit(1);
  }
})();
