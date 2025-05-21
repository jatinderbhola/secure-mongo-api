import { getMeterToFeetInchesWithoutFraction } from './../utils/UnitConversion.js';

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

    return { pagedData: postOperations(model, pagedData), total };
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

    let pagedData = await collection.aggregate(fetchByIdsPipeline(ids)).toArray();

    return { pagedData: postOperations(model, pagedData), total: pagedData.length };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};

const postOperations = (model, pagedData) => {
  if (model === 'rug') {
    pagedData = pagedData.map((data) => {
      data.sizeInMetric = null;
      data.size = null;
      if (data?.dimension?.width && data?.dimension?.length) {
        data.sizeInMetric =
          Number(data?.dimension?.width).toFixed(2) +
          ' x ' +
          Number(data?.dimension?.length).toFixed(2);
        const width = getMeterToFeetInchesWithoutFraction(data?.dimension?.width);
        const length = getMeterToFeetInchesWithoutFraction(data?.dimension?.length);
        data.size = `${width} x ${length}`;
      }

      return data;
    });
  }

  return pagedData;
};
