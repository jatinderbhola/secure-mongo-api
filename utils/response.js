export const sendPaginatedResponse = (
  res,
  { data, pagination: { total, limit, skip, model }, clientInfo }
) => {
  const nextSkip = skip + limit < total ? skip + limit : null;
  const prevSkip = skip - limit >= 0 ? skip - limit : null;

  res.json({
    data,
    pagination: {
      total,
      limit,
      skip,
      next: nextSkip !== null ? `/api/${model}?limit=${limit}&skip=${nextSkip}` : null,
      prev: prevSkip !== null ? `/api/${model}?limit=${limit}&skip=${prevSkip}` : null
    },
    client: clientInfo
  });
};
