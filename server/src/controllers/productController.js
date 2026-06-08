import Product from '../models/Product.js';
import {
  addProduct,
  changeStock,
  editProduct,
  getProductById,
  listProducts,
  removeProduct
} from '../data/memoryStore.js';

function usesMemory(req) {
  return req.app.locals.dataMode === 'memory';
}

export async function getProducts(req, res, next) {
  try {
    if (usesMemory(req)) {
      res.json(listProducts(req.query));
      return;
    }

    const { search = '', category = '', status = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    if (usesMemory(req)) {
      const product = getProductById(req.params.id);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
      res.json(product);
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    if (usesMemory(req)) {
      res.status(201).json(addProduct(req.body));
      return;
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    if (error.code === 11000) {
      res.status(409);
      error.message = 'A product with that SKU already exists.';
    }
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (usesMemory(req)) {
      const product = editProduct(req.params.id, req.body);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
      res.json(product);
      return;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    if (error.code === 11000) {
      res.status(409);
      error.message = 'A product with that SKU already exists.';
    }
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    if (usesMemory(req)) {
      if (!removeProduct(req.params.id)) {
        res.status(404);
        throw new Error('Product not found');
      }
      res.json({ message: 'Product deleted' });
      return;
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}

export async function adjustStock(req, res, next) {
  try {
    const { quantity, type } = req.body;
    const amount = Number(quantity);

    if (!['increase', 'decrease'].includes(type)) {
      res.status(400);
      throw new Error('Stock adjustment type must be increase or decrease.');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400);
      throw new Error('Quantity must be a positive number.');
    }

    if (usesMemory(req)) {
      const product = changeStock(req.params.id, type, amount);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
      res.json(product);
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (type === 'decrease' && product.stock < amount) {
      res.status(400);
      throw new Error('Stock cannot go below zero.');
    }

    product.stock = type === 'decrease' ? product.stock - amount : product.stock + amount;
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
}
