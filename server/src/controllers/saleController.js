import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { addSale, listSales } from '../data/memoryStore.js';

function usesMemory(req) {
  return req.app.locals.dataMode === 'memory';
}

export async function getSales(req, res, next) {
  try {
    if (usesMemory(req)) {
      res.json(listSales());
      return;
    }

    const sales = await Sale.find().sort({ createdAt: -1 }).limit(100);
    res.json(sales);
  } catch (error) {
    next(error);
  }
}

export async function createSale(req, res, next) {
  try {
    const { customerName, paymentMethod, notes, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('A sale must include at least one item.');
    }

    if (usesMemory(req)) {
      res.status(201).json(addSale({ customerName, paymentMethod, notes, items }));
      return;
    }

    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const saleItems = [];
    let totalAmount = 0;
    let totalCost = 0;

    for (const item of items) {
      const product = productMap.get(item.product);
      const quantity = Number(item.quantity);

      if (!product) {
        res.status(400);
        throw new Error('One or more products are unavailable.');
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        res.status(400);
        throw new Error('Sale item quantities must be at least 1.');
      }

      if (product.stock < quantity) {
        res.status(400);
        throw new Error(`${product.name} only has ${product.stock} units in stock.`);
      }

      const lineTotal = product.price * quantity;
      const lineCost = product.cost * quantity;

      saleItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        price: product.price,
        cost: product.cost,
        lineTotal
      });

      totalAmount += lineTotal;
      totalCost += lineCost;
      product.stock -= quantity;
    }

    await Promise.all(products.map((product) => product.save()));

    const sale = await Sale.create({
      customerName,
      paymentMethod,
      notes,
      items: saleItems,
      totalAmount,
      totalCost
    });

    res.status(201).json(sale);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
}
