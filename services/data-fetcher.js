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

export const fetch = async (db, model, { limit, skip, ids }) => {
  try {
    if (!db) {
      throw new Error(`Client database connection is not established`);
    }

    const collection = db.collection(model);

    const total = await collection.countDocuments();
    const pagedData = await collection.aggregate(pipeline(limit, skip, ids)).toArray();

    return { pagedData, total };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};

const fetchByIdsPipeline = (ids = []) => [
  {
    $match: {
      ID: { $in: ids.map((id) => String(id)) }
    }
  },
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
  }
];

export const fetchIds = async (db, model, ids) => {
  try {
    if (!db) {
      throw new Error(`Client database connection is not established`);
    }

    const collection = db.collection(model);

    const pagedData = await collection.aggregate(fetchByIdsPipeline(ids)).toArray();

    return { pagedData, total: pagedData.length };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};
