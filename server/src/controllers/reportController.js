import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { getAnalyticsData, getSummaryData } from '../data/memoryStore.js';

function usesMemory(req) {
  return req.app.locals.dataMode === 'memory';
}

export async function getSummary(req, res, next) {
  try {
    if (usesMemory(req)) {
      res.json(getSummaryData());
      return;
    }

    const [products, sales] = await Promise.all([
      Product.find(),
      Sale.find().sort({ createdAt: -1 }).limit(8)
    ]);

    const salesTotals = await Sale.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          cost: { $sum: '$totalCost' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const totals = salesTotals[0] || { revenue: 0, cost: 0, salesCount: 0 };
    const lowStock = products.filter((product) => product.stock <= product.reorderLevel && product.isActive);

    res.json({
      totals: {
        products: products.length,
        activeProducts: products.filter((product) => product.isActive).length,
        inventoryValue: products.reduce((sum, product) => sum + product.stock * product.cost, 0),
        stockUnits: products.reduce((sum, product) => sum + product.stock, 0),
        lowStock: lowStock.length,
        revenue: totals.revenue,
        profit: totals.revenue - totals.cost,
        salesCount: totals.salesCount
      },
      lowStock,
      recentSales: sales
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    if (usesMemory(req)) {
      res.json(getAnalyticsData());
      return;
    }

    const [categoryBreakdown, topProducts, monthlySales, lowStock] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            products: { $sum: 1 },
            units: { $sum: '$stock' },
            value: { $sum: { $multiply: ['$stock', '$cost'] } }
          }
        },
        { $sort: { value: -1 } }
      ]),
      Sale.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            sku: { $first: '$items.sku' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.lineTotal' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 }
      ]),
      Sale.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            profit: { $sum: { $subtract: ['$totalAmount', '$totalCost'] } },
            sales: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Product.find({ isActive: true, $expr: { $lte: ['$stock', '$reorderLevel'] } }).sort({ stock: 1 })
    ]);

    res.json({ categoryBreakdown, topProducts, monthlySales, lowStock });
  } catch (error) {
    next(error);
  }
}
