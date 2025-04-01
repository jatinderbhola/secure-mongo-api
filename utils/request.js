export const validateDataRequest = (query) => {
  const { model, limit = 50, skip = 0 } = query;

  if (!model || typeof model !== 'string') {
    return { error: 'Missing or invalid "model" parameter' };
  }

  const parsedLimit = Math.min(parseInt(limit), 500);
  const parsedSkip = parseInt(skip);

  return {
    error: null,
    model,
    limit: parsedLimit,
    skip: parsedSkip
  };
};
