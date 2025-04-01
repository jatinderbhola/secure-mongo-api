import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/token', authenticateClient, (req, res) => {
  const callback = req.body.callback;
  if (!callback || !req.client.allowedCallbacks.includes(callback)) {
    return res.status(403).json({ error: 'Invalid callback URL' });
  }

  const token = jwt.sign(
    {
      name: req.client.name,
      portalRef: req.client.portalRef,
      email: req.client.email,
      clientId: req.client._id,
      database: req.client.database
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  res.json({ token });
});

export default router;
