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
const port = process.env.PORT || 5000;

app.locals.dataMode = 'mongo';

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventory-api' });
});

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

try {
  await connectDB();
} catch (error) {
  app.locals.dataMode = 'memory';
  console.warn(`MongoDB unavailable, using in-memory demo data: ${error.message}`);
}

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  console.log(`Data mode: ${app.locals.dataMode}`);
});
