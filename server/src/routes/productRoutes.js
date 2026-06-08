import express from 'express';
import {
  adjustStock,
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct
} from '../controllers/productController.js';

const router = express.Router();

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);
router.patch('/:id/stock', adjustStock);

export default router;
