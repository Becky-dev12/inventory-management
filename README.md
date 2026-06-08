# Inventory Management System

A full-stack MERN app for product management, stock tracking, sales records, and reports.

## Features

- Product CRUD with SKU, category, supplier, price, cost, and reorder level.
- Stock tracking with explicit stock adjustments and low-stock indicators.
- Sales recording with automatic inventory deduction.
- Dashboard metrics for revenue, profit, inventory value, and stock risk.
- Reports and analytics for category mix, top products, recent sales, and low stock.

## Tech Stack

- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Axios + React Router

## Setup

1. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.
2. Install dependencies:

   ```bash
   npm run install:all
   npm install
   ```

3. Seed demo data:

   ```bash
   npm run seed
   ```

4. Start both apps:

   ```bash
   npm run dev
   ```

The API runs on `http://localhost:5000` and the client runs on `http://localhost:5173`.
