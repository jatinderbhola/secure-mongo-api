export const validateDataRequest = (query) => {
  const { model, limit = 50, skip = 0, ids = [] } = query;

  if (!model || typeof model !== 'string') {
    return { error: 'Missing or invalid "model" parameter' };
  }

  const parsedLimit = Math.min(parseInt(limit), 500);
  const parsedSkip = parseInt(skip);

  return {
    model,
    ids,
    error: null,
    limit: parsedLimit,
    skip: parsedSkip
  };
};
