import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export const useDb = async (dbName) => {
  const db = mongoose.connection.useDb(dbName);

  try {
    await db.db.admin().ping(); // validate the connection
    return db;
  } catch (err) {
    console.error(`[Error] Failed to connect to database "${dbName}":`, err.message);
    throw new Error(`Invalid or unreachable database: ${dbName}`);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
