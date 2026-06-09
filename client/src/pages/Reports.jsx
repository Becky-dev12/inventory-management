import React from 'react';
import { AlertCircle, BarChart3, Boxes, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { fetchAnalytics } from '../services/api.js';
import { currency } from '../utils/formatters.js';

function BarList({ items, valueKey, labelKey, formatter = (value) => value }) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item._id?.toString() || item[labelKey]}>
          <div>
            <strong>{item[labelKey]}</strong>
            <span>{formatter(item[valueKey])}</span>
          </div>
          <div className="bar-track">
            <span style={{ width: `${Math.max((item[valueKey] / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics().then(setAnalytics).catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  if (error) return <EmptyState title="Reports unavailable" message={error} />;
  if (!analytics) return <div className="loading">Loading reports...</div>;

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Analyze Ethiopian market inventory, birr revenue, and replenishment needs.</p>
        </div>
      </header>

      <div className="report-grid">
        <section className="panel">
          <div className="section-title">
            <h2>Inventory by category</h2>
            <Boxes size={20} />
          </div>
          {analytics.categoryBreakdown.length === 0 ? (
            <EmptyState title="No inventory data" message="Add products to build this report." />
          ) : (
            <BarList items={analytics.categoryBreakdown} valueKey="value" labelKey="_id" formatter={currency.format} />
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Top products</h2>
            <Trophy size={20} />
          </div>
          {analytics.topProducts.length === 0 ? (
            <EmptyState title="No sales data" message="Top products appear after sales are recorded." />
          ) : (
            <BarList items={analytics.topProducts} valueKey="revenue" labelKey="name" formatter={currency.format} />
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Monthly sales</h2>
            <BarChart3 size={20} />
          </div>
          {analytics.monthlySales.length === 0 ? (
            <EmptyState title="No sales timeline" message="Monthly revenue appears after sales are recorded." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlySales.map((month) => (
                    <tr key={`${month._id.year}-${month._id.month}`}>
                      <td>{month._id.year}-{String(month._id.month).padStart(2, '0')}</td>
                      <td>{month.sales}</td>
                      <td>{currency.format(month.revenue)}</td>
                      <td>{currency.format(month.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Reorder watch</h2>
            <AlertCircle size={20} />
          </div>
          {analytics.lowStock.length === 0 ? (
            <EmptyState title="No reorder alerts" message="Every active product is above reorder level." />
          ) : (
            <div className="alert-list">
              {analytics.lowStock.map((product) => (
                <div className="alert-row" key={product._id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                  <small>{product.stock} left, reorder at {product.reorderLevel}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
