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

await connectDB();

app.use('/api', authRoutes);
app.use('/api', clientRoutes);
app.use('/api', dataRoutes);
app.use('/admin', adminRoutes);

// Unmatched API/Admin route fallback
app.use('/api/*', (req, res) => res.status(404).json({ error: 'API Route Not Found' }));
app.use('/admin/*', (req, res) => res.status(404).json({ error: 'Admin Route Not Found' }));

// Global error handler (keep this after routes)
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res
      .status(409)
      .json({ error: 'Duplicate key error', details: err.keyValue || err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  res.status(status).json({ error: message });
});

// Health check and root route
app.use('/health-check', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/', (req, res) => res.send(`Welcome to RugSimple ${process.env.NODE_ENV} API`));

// Fallback for all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
