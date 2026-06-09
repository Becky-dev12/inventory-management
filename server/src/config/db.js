import mongoose from 'mongoose';

const globalCache = globalThis;

if (!globalCache.mongoose) {
  globalCache.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/inventory_management';

  if (globalCache.mongoose.conn) {
    return globalCache.mongoose.conn;
  }

  if (!globalCache.mongoose.promise) {
    mongoose.set('strictQuery', true);
    globalCache.mongoose.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  globalCache.mongoose.conn = await globalCache.mongoose.promise;
  return globalCache.mongoose.conn;
}
