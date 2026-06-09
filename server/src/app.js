import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import saleRoutes from './routes/saleRoutes.js';

dotenv.config();

const app = express();

app.locals.dataMode = 'mongo';
app.locals.dbInitialized = false;

app.use(async (req, res, next) => {
  if (req.app.locals.dbInitialized) {
    return next();
  }

  try {
    await connectDB();
    req.app.locals.dataMode = 'mongo';
  } catch (error) {
    req.app.locals.dataMode = 'memory';
    console.warn(`MongoDB unavailable, using in-memory data: ${error.message}`);
  }

  req.app.locals.dbInitialized = true;
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'inventory-api',
    dataMode: req.app.locals.dataMode
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Inventory API is running'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
