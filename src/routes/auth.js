import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/token', authenticateClient, (req, res) => {
  // const callback = req.body.callback;
  // if (!callback || !req.client.allowedCallbacks.includes(callback)) {
  //   return res.status(403).json({ error: 'Invalid callback URL' });
  // }

  const token = jwt.sign(
    {
      p: req.client.portalRef,
      n: req.client.name,
      db: req.client.database
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  res.json({ token });
});

export default router;
