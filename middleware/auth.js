import { Client } from '../models/client.js';
import { verifyApiKey } from '../utils/hash.js';

export const authenticateClient = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const origin = req.header('origin');

  if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

  const clients = await Client.find({});
  const client = await Promise.any(
    clients.map(async (c) => {
      if (await verifyApiKey(apiKey, c.apiKeyHash)) return c;
      throw new Error();
    })
  ).catch(() => null);

  if (!client) return res.status(403).json({ error: 'Invalid API Key' });

  if (origin && !client.allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  req.client = client;
  next();
};
