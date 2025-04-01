const pipeline = (limit, skip) => [
  {
    $lookup: {
      from: 'item_collection',
      localField: 'collections',
      foreignField: '_id',
      as: 'collectionDocs'
    }
  },
  {
    $lookup: {
      from: 'image',
      localField: '_id',
      foreignField: 'parentRef',
      as: 'images'
    }
  },
  {
    $skip: skip
  },
  {
    $limit: limit
  }
];

export const fetch = async (db, model, { limit, skip }) => {
  try {
    if (!db) {
      throw new Error(`Client database connection is not established`);
    }

    const collection = db.collection(model);

    const total = await collection.countDocuments();
    const pagedData = await collection.aggregate(pipeline(limit, skip)).toArray();

    return { pagedData, total };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};
