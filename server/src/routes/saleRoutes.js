import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';

const router = express.Router();

router.route('/').get(getSales).post(createSale);

export default router;
