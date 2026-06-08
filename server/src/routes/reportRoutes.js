import express from 'express';
import { getAnalytics, getSummary } from '../controllers/reportController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);

export default router;
