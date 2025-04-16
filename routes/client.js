import express from 'express';
const router = express.Router();

import { asyncHandler } from '../utils/asyncHandler.js';

import { Client } from '../models/client.js';
import { authenticateClient } from '../middleware/auth.js';

router.delete(
  '/client',
  authenticateClient,
  asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // delete the client
    const client = await Client.findOneAndDelete({ email });
    if (!client) {
      return res.status(404).json({ error: `Client not found for ${email}` });
    }

    res.status(201).json({
      message: 'Client deleted successfully',
      data: {}
    });
  })
);

export default router;
