import express from 'express';
const router = express.Router();
import { Client } from '../models/client.js';
import { hashApiKey } from '../utils/hash.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { useDb } from '../db.js';

router.post(
  '/create-client',
  asyncHandler(async (req, res) => {
    const { name, email, apiKey, allowedOrigins, allowedCallbacks } = req.body;

    const apiKeyHash = await hashApiKey(apiKey);

    // Fetch the portal database using the email
    const portalDatabase = await useDb(process.env.PORTAL_DATABASE);
    if (!portalDatabase) {
      return res
        .status(500)
        .json({ error: `Database connection failed for portal database ${email}` });
    }

    const portal = await portalDatabase
      .collection('portal')
      .findOne(
        { email: email.trim() },
        { projection: { email: 1, database: 1, 'company.name': 1 } }
      );

    if (!portal?._id) {
      return res.status(404).json({ error: `Portal not found for ${email}` });
    }

    // create a new client
    const client = new Client({
      name,
      email,
      apiKeyHash,
      allowedOrigins,
      allowedCallbacks,
      // Portal reference
      companyName: portal.company.name,
      portalRef: portal._id,
      database: portal.database
    });

    await client.save();
    res.status(201).json({ message: 'Client created successfully' });
  })
);

export default router;
