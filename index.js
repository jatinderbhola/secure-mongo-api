import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

await connectDB();

app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/admin', adminRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);

  // MongoDB duplicate key error (code 11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate key error',
      details: err.keyValue || err.message
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Handle other errors
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({ error: message });
});

// Health check route
app.use('/health-check', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/', (req, res) => {
  res.send('Welcome to RugSimple');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
