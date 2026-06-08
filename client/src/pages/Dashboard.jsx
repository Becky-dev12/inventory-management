import { AlertTriangle, Banknote, Boxes, ChartNoAxesColumnIncreasing, PackageCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { fetchSummary } from '../services/api.js';
import { currency, formatDate, number } from '../utils/formatters.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary().then(setSummary).catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  if (error) return <EmptyState title="API unavailable" message={error} />;
  if (!summary) return <div className="loading">Loading dashboard...</div>;

  const { totals } = summary;

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Live overview of Ethiopian market stock, ETB sales, and reorder risk.</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard icon={Boxes} label="Products" value={number.format(totals.activeProducts)} hint={`${totals.products} total`} />
        <StatCard icon={PackageCheck} label="Stock units" value={number.format(totals.stockUnits)} hint="On hand" />
        <StatCard icon={Banknote} label="Inventory value" value={currency.format(totals.inventoryValue)} hint="At ETB cost" />
        <StatCard icon={TrendingUp} label="ETB revenue" value={currency.format(totals.revenue)} hint={`${totals.salesCount} sales`} />
        <StatCard icon={ChartNoAxesColumnIncreasing} label="Profit" value={currency.format(totals.profit)} hint="Gross profit" />
        <StatCard icon={AlertTriangle} label="Low stock" value={number.format(totals.lowStock)} hint="Needs attention" />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h2>Recent sales</h2>
          </div>
          {summary.recentSales.length === 0 ? (
            <EmptyState title="No sales yet" message="Sales will appear here once recorded." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.customerName}</td>
                      <td>{sale.items.length}</td>
                      <td>{currency.format(sale.totalAmount)}</td>
                      <td>{formatDate(sale.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Low stock alerts</h2>
          </div>
          {summary.lowStock.length === 0 ? (
            <EmptyState title="Stock looks healthy" message="No products are below reorder level." />
          ) : (
            <div className="alert-list">
              {summary.lowStock.map((product) => (
                <div className="alert-row" key={product._id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sku}</span>
                  </div>
                  <div>
                    <StatusBadge status={product.status} />
                    <small>{product.stock} / {product.reorderLevel}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
