import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import Sale from './models/Sale.js';

dotenv.config();

const products = [
  {
    name: 'Yirgacheffe Coffee Beans 1kg',
    sku: 'COFF-100',
    category: 'Coffee & Spices',
    supplier: 'Oromia Coffee Union',
    price: 780,
    cost: 520,
    stock: 42,
    reorderLevel: 12,
    description: 'Washed Arabica coffee beans for Addis Ababa retail counters.'
  },
  {
    name: 'White Teff Flour 25kg',
    sku: 'TEFF-220',
    category: 'Grains & Staples',
    supplier: 'Sheger Grain Traders',
    price: 3150,
    cost: 2600,
    stock: 18,
    reorderLevel: 10,
    description: 'Premium white teff flour sack for groceries and injera houses.'
  },
  {
    name: 'Berbere Spice Mix 500g',
    sku: 'BERB-330',
    category: 'Coffee & Spices',
    supplier: 'Merkato Spice House',
    price: 240,
    cost: 150,
    stock: 65,
    reorderLevel: 25,
    description: 'Fresh berbere blend packaged for supermarket shelves.'
  },
  {
    name: 'Bottled Water 24 Pack',
    sku: 'WATR-440',
    category: 'Beverages',
    supplier: 'Aqua Addis Distribution',
    price: 420,
    cost: 310,
    stock: 16,
    reorderLevel: 30,
    description: 'Half-liter bottled water cartons for retail and offices.'
  },
  {
    name: 'Electric Injera Mitad',
    sku: 'MITAD-550',
    category: 'Appliances',
    supplier: 'Ethio Home Appliances',
    price: 6900,
    cost: 5200,
    stock: 6,
    reorderLevel: 4,
    description: 'Electric mitad for home kitchens and small food businesses.'
  }
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Sale.deleteMany({});

  const createdProducts = await Product.insertMany(products);
  const coffee = createdProducts.find((product) => product.sku === 'COFF-100');
  const teff = createdProducts.find((product) => product.sku === 'TEFF-220');

  await Sale.create({
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
    notes: 'Opening Ethiopian market demo sale'
  });

  coffee.stock -= 4;
  teff.stock -= 2;
  await Promise.all([coffee.save(), teff.save()]);

  console.log('Demo data seeded');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
