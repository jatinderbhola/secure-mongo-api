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
  if (!authHeader) return res.status(401).send('Missing auth header');

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
    return res.status(403).send('Invalid or expired token', err);
  }
};

router.get(
  '/:model',
  verifyJwt,
  asyncHandler(async (req, res) => {
    const { error, model, limit, skip } = validateDataRequest({ ...req.query, ...req.params });
    if (error) {
      return res.status(400).json({ error });
    }
    if (model !== 'rug') {
      return res.status(400).json({ error: `Invalid model : ${model}` });
    }

    const clientDb = await useDb(req.user.database);
    const { pagedData, total } = await fetch(clientDb, model, { limit, skip });

    sendPaginatedResponse(res, {
      data: pagedData,
      pagination: { total, limit, skip, model },
      clientInfo: { name: req.user.name }
    });
  })
);

router.post(
  '/:model',
  verifyJwt,
  asyncHandler(async (req, res) => {
    const { model, ids } = validateDataRequest({ ...req.query, ...req.params, ...req.body });
    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => typeof id !== 'string')
    ) {
      return res
        .status(400)
        .json({ error: `Missing or invalid ids in the body. ids should be array of string.` });
    }
    if (!model) {
      return res.status(400).json({ error: 'Missing model in the query' });
    }
    //TODO: This is due to a API specification typo provided by us to simon. Should be fixed in the future
    const parsedModel = model === 'rugs' ? 'rug' : model;
    if (parsedModel !== 'rug') {
      return res.status(400).json({ error: `Invalid model : ${parsedModel}` });
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
