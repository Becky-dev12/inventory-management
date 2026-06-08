import crypto from 'crypto';

const now = new Date().toISOString();

const products = [
  {
    _id: crypto.randomUUID(),
    name: 'Yirgacheffe Coffee Beans 1kg',
    sku: 'COFF-100',
    category: 'Coffee & Spices',
    supplier: 'Oromia Coffee Union',
    price: 780,
    cost: 520,
    stock: 38,
    reorderLevel: 12,
    description: 'Washed Arabica coffee beans for Addis Ababa retail counters.',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: crypto.randomUUID(),
    name: 'White Teff Flour 25kg',
    sku: 'TEFF-220',
    category: 'Grains & Staples',
    supplier: 'Sheger Grain Traders',
    price: 3150,
    cost: 2600,
    stock: 16,
    reorderLevel: 10,
    description: 'Premium white teff flour sack for groceries and injera houses.',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: crypto.randomUUID(),
    name: 'Berbere Spice Mix 500g',
    sku: 'BERB-330',
    category: 'Coffee & Spices',
    supplier: 'Merkato Spice House',
    price: 240,
    cost: 150,
    stock: 65,
    reorderLevel: 25,
    description: 'Fresh berbere blend packaged for supermarket shelves.',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: crypto.randomUUID(),
    name: 'Bottled Water 24 Pack',
    sku: 'WATR-440',
    category: 'Beverages',
    supplier: 'Aqua Addis Distribution',
    price: 420,
    cost: 310,
    stock: 16,
    reorderLevel: 30,
    description: 'Half-liter bottled water cartons for retail and offices.',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: crypto.randomUUID(),
    name: 'Electric Injera Mitad',
    sku: 'MITAD-550',
    category: 'Appliances',
    supplier: 'Ethio Home Appliances',
    price: 6900,
    cost: 5200,
    stock: 6,
    reorderLevel: 4,
    description: 'Electric mitad for home kitchens and small food businesses.',
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

const coffee = products.find((product) => product.sku === 'COFF-100');
const teff = products.find((product) => product.sku === 'TEFF-220');

const sales = [
  {
    _id: crypto.randomUUID(),
    customerName: 'Bole Mini Market',
    paymentMethod: 'Telebirr',
    items: [
      {
        product: coffee._id,
        name: coffee.name,
        sku: coffee.sku,
        quantity: 4,
        price: coffee.price,
        cost: coffee.cost,
        lineTotal: coffee.price * 4
      },
      {
        product: teff._id,
        name: teff.name,
        sku: teff.sku,
        quantity: 2,
        price: teff.price,
        cost: teff.cost,
        lineTotal: teff.price * 2
      }
    ],
    totalAmount: coffee.price * 4 + teff.price * 2,
    totalCost: coffee.cost * 4 + teff.cost * 2,
    notes: 'Opening Ethiopian market demo sale',
    createdAt: now,
    updatedAt: now
  }
];

function decorateProduct(product) {
  const status = !product.isActive
    ? 'Inactive'
    : product.stock === 0
      ? 'Out of stock'
      : product.stock <= product.reorderLevel
        ? 'Low stock'
        : 'In stock';

  return {
    ...product,
    id: product._id,
    inventoryValue: product.stock * product.cost,
    status
  };
}

function decorateSale(sale) {
  return {
    ...sale,
    id: sale._id,
    profit: sale.totalAmount - sale.totalCost
  };
}

function matchesSearch(product, search) {
  const term = search.toLowerCase();
  return [product.name, product.sku, product.supplier].some((value) => value.toLowerCase().includes(term));
}

export function listProducts({ search = '', category = '', status = '' } = {}) {
  return products
    .filter((product) => (search ? matchesSearch(product, search) : true))
    .filter((product) => (category ? product.category === category : true))
    .filter((product) => (status === 'active' ? product.isActive : true))
    .filter((product) => (status === 'inactive' ? !product.isActive : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(decorateProduct);
}

export function getProductById(id) {
  const product = products.find((entry) => entry._id === id);
  return product ? decorateProduct(product) : null;
}

export function addProduct(payload) {
  if (products.some((product) => product.sku.toLowerCase() === payload.sku.toLowerCase())) {
    const error = new Error('A product with that SKU already exists.');
    error.statusCode = 409;
    throw error;
  }

  const product = {
    _id: crypto.randomUUID(),
    name: payload.name,
    sku: payload.sku.toUpperCase(),
    category: payload.category,
    supplier: payload.supplier || '',
    price: Number(payload.price),
    cost: Number(payload.cost),
    stock: Number(payload.stock),
    reorderLevel: Number(payload.reorderLevel),
    description: payload.description || '',
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.unshift(product);
  return decorateProduct(product);
}

export function editProduct(id, payload) {
  const product = products.find((entry) => entry._id === id);
  if (!product) return null;

  if (
    payload.sku &&
    products.some((entry) => entry._id !== id && entry.sku.toLowerCase() === payload.sku.toLowerCase())
  ) {
    const error = new Error('A product with that SKU already exists.');
    error.statusCode = 409;
    throw error;
  }

  Object.assign(product, {
    ...payload,
    sku: payload.sku ? payload.sku.toUpperCase() : product.sku,
    price: payload.price === undefined ? product.price : Number(payload.price),
    cost: payload.cost === undefined ? product.cost : Number(payload.cost),
    stock: payload.stock === undefined ? product.stock : Number(payload.stock),
    reorderLevel: payload.reorderLevel === undefined ? product.reorderLevel : Number(payload.reorderLevel),
    updatedAt: new Date().toISOString()
  });

  return decorateProduct(product);
}

export function removeProduct(id) {
  const index = products.findIndex((product) => product._id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export function changeStock(id, type, quantity) {
  const product = products.find((entry) => entry._id === id);
  if (!product) return null;

  if (type === 'decrease' && product.stock < quantity) {
    const error = new Error('Stock cannot go below zero.');
    error.statusCode = 400;
    throw error;
  }

  product.stock = type === 'decrease' ? product.stock - quantity : product.stock + quantity;
  product.updatedAt = new Date().toISOString();
  return decorateProduct(product);
}

export function listSales() {
  return sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(decorateSale);
}

export function addSale(payload) {
  const saleItems = [];
  let totalAmount = 0;
  let totalCost = 0;

  for (const item of payload.items) {
    const product = products.find((entry) => entry._id === item.product && entry.isActive);
    const quantity = Number(item.quantity);

    if (!product) {
      const error = new Error('One or more products are unavailable.');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      const error = new Error('Sale item quantities must be at least 1.');
      error.statusCode = 400;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error(`${product.name} only has ${product.stock} units in stock.`);
      error.statusCode = 400;
      throw error;
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
    product.updatedAt = new Date().toISOString();
  }

  const sale = {
    _id: crypto.randomUUID(),
    customerName: payload.customerName || 'Walk-in customer',
    paymentMethod: payload.paymentMethod || 'Telebirr',
    notes: payload.notes || '',
    items: saleItems,
    totalAmount,
    totalCost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sales.unshift(sale);
  return decorateSale(sale);
}

export function getSummaryData() {
  const decoratedProducts = products.map(decorateProduct);
  const decoratedSales = listSales();
  const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const cost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
  const lowStock = decoratedProducts.filter((product) => product.isActive && product.stock <= product.reorderLevel);

  return {
    totals: {
      products: products.length,
      activeProducts: products.filter((product) => product.isActive).length,
      inventoryValue: products.reduce((sum, product) => sum + product.stock * product.cost, 0),
      stockUnits: products.reduce((sum, product) => sum + product.stock, 0),
      lowStock: lowStock.length,
      revenue,
      profit: revenue - cost,
      salesCount: sales.length
    },
    lowStock,
    recentSales: decoratedSales.slice(0, 8)
  };
}

export function getAnalyticsData() {
  const categories = new Map();
  const topProducts = new Map();
  const monthly = new Map();

  for (const product of products) {
    const current = categories.get(product.category) || { _id: product.category, products: 0, units: 0, value: 0 };
    current.products += 1;
    current.units += product.stock;
    current.value += product.stock * product.cost;
    categories.set(product.category, current);
  }

  for (const sale of sales) {
    const date = new Date(sale.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const currentMonth = monthly.get(key) || {
      _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
      revenue: 0,
      profit: 0,
      sales: 0
    };
    currentMonth.revenue += sale.totalAmount;
    currentMonth.profit += sale.totalAmount - sale.totalCost;
    currentMonth.sales += 1;
    monthly.set(key, currentMonth);

    for (const item of sale.items) {
      const currentProduct = topProducts.get(item.product) || {
        _id: item.product,
        name: item.name,
        sku: item.sku,
        quantity: 0,
        revenue: 0
      };
      currentProduct.quantity += item.quantity;
      currentProduct.revenue += item.lineTotal;
      topProducts.set(item.product, currentProduct);
    }
  }

  return {
    categoryBreakdown: [...categories.values()].sort((a, b) => b.value - a.value),
    topProducts: [...topProducts.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    monthlySales: [...monthly.values()].sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month),
    lowStock: products
      .map(decorateProduct)
      .filter((product) => product.isActive && product.stock <= product.reorderLevel)
      .sort((a, b) => a.stock - b.stock)
  };
}
