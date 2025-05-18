import express from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

import { validateDataRequest } from '../utils/request.js';
import { sendPaginatedResponse } from '../utils/response.js';
import { fetch, fetchIds } from '../services/data-fetcher.js';
import { useDb } from '../db.js';

const router = express.Router();

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      name: decoded.n,
      database: decoded.db,
      portalRef: decoded.p
    };
    next();
  } catch (err) {
    console.error('[JWT Error]', err.message);
    return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
  }
};

router
  .get(
    '/:model',
    verifyJwt,
    asyncHandler(async (req, res) => {
      const { error, model, limit, skip } = validateDataRequest({
        ...req.query,
        model: req.params.model
      });

      if (error) return res.status(400).json({ error });

      if (model !== 'rug') {
        return res.status(400).json({ error: `Invalid model: ${model}` });
      }

      const clientDb = await useDb(req.user.database);
      const { pagedData, total } = await fetch(clientDb, model, { limit, skip });

      sendPaginatedResponse(res, {
        data: pagedData,
        pagination: { total, limit, skip, model },
        clientInfo: { name: req.user.name }
      });
    })
  )
  .post(
    '/:model',
    verifyJwt,
    asyncHandler(async (req, res) => {
      const { model, ids } = validateDataRequest({
        ...req.body,
        ...req.query,
        model: req.params.model
      });

      if (
        !ids ||
        !Array.isArray(ids) ||
        ids.length === 0 ||
        ids.some((id) => typeof id !== 'string')
      ) {
        return res.status(400).json({
          error: 'Invalid request: "ids" must be a non-empty array of strings in the body.'
        });
      }

      if (!model) {
        return res.status(400).json({ error: 'Missing model in the request' });
      }

      // Temporary fix for legacy input
      const parsedModel = model === 'rugs' ? 'rug' : model;

      if (parsedModel !== 'rug') {
        return res.status(400).json({ error: `Invalid model: ${parsedModel}` });
      }

      const clientDb = await useDb(req.user.database);
      const { pagedData, total } = await fetchIds(clientDb, parsedModel, ids);

      sendPaginatedResponse(res, {
        data: pagedData,
        pagination: { total, limit: null, skip: null, model },
        clientInfo: { name: req.user.name }
      });
    })
  );

export default router;
