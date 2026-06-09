import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

try {
  await connectDB();
  app.locals.dataMode = 'mongo';
  console.log('MongoDB connected successfully');
} catch (error) {
  app.locals.dataMode = 'memory';
  console.warn(`MongoDB unavailable, using in-memory data: ${error.message}`);
}

app.locals.dbInitialized = true;

app.listen(port, () => {
  console.log(`API running on port ${port}`);
  console.log(`Data mode: ${app.locals.dataMode}`);
});
