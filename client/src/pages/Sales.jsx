import { Plus, ReceiptText, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { createSale, fetchProducts, fetchSales } from '../services/api.js';
import { currency, formatDate } from '../utils/formatters.js';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    customerName: '',
    paymentMethod: 'Telebirr',
    notes: '',
    items: [{ product: '', quantity: 1 }]
  });
  const [error, setError] = useState('');

  async function load() {
    const [productData, saleData] = await Promise.all([fetchProducts({ status: 'active' }), fetchSales()]);
    setProducts(productData);
    setSales(saleData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  const total = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const product = products.find((entry) => entry._id === item.product);
      return sum + (product ? product.price * Number(item.quantity || 0) : 0);
    }, 0);
  }, [form.items, products]);

  function updateItem(index, patch) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await createSale({
        ...form,
        customerName: form.customerName || 'Walk-in customer',
        items: form.items.filter((item) => item.product).map((item) => ({ ...item, quantity: Number(item.quantity) }))
      });
      setForm({ customerName: '', paymentMethod: 'Telebirr', notes: '', items: [{ product: '', quantity: 1 }] });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <h1>Sales</h1>
          <p>Record Ethiopian retail sales, accept local payments, and deduct stock automatically.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="two-column align-start">
        <form className="panel sale-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>New sale</h2>
            <ReceiptText size={20} />
          </div>
          <label>
            Customer
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              placeholder="Walk-in customer"
            />
          </label>
          <label>
            Payment
            <select
              value={form.paymentMethod}
              onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
            >
              <option>Telebirr</option>
              <option>CBE Birr</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Card</option>
            </select>
          </label>

          <div className="line-items">
            {form.items.map((item, index) => {
              const product = products.find((entry) => entry._id === item.product);
              return (
                <div className="line-item" key={`${index}-${item.product}`}>
                  <select value={item.product} onChange={(event) => updateItem(index, { product: event.target.value })} required>
                    <option value="">Select product</option>
                    {products.map((entry) => (
                      <option key={entry._id} value={entry._id}>
                        {entry.name} - {entry.stock} in stock
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max={product?.stock || undefined}
                    value={item.quantity}
                    onChange={(event) => updateItem(index, { quantity: event.target.value })}
                    required
                  />
                  <strong>{product ? currency.format(product.price * Number(item.quantity || 0)) : currency.format(0)}</strong>
                  <button
                    type="button"
                    title="Remove item"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        items: current.items.filter((_, itemIndex) => itemIndex !== index)
                      }))
                    }
                    disabled={form.items.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            className="button secondary"
            type="button"
            onClick={() => setForm((current) => ({ ...current, items: [...current.items, { product: '', quantity: 1 }] }))}
          >
            <Plus size={18} />
            Add item
          </button>
          <label>
            Notes
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
          <div className="sale-total">
            <span>Total</span>
            <strong>{currency.format(total)}</strong>
          </div>
          <button className="button primary">Record sale</button>
        </form>

        <section className="panel">
          <div className="section-title">
            <h2>Sales records</h2>
          </div>
          {sales.length === 0 ? (
            <EmptyState title="No sales recorded" message="Completed sales will appear in this table." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.customerName}</td>
                      <td>{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td>{sale.paymentMethod}</td>
                      <td>{currency.format(sale.totalAmount)}</td>
                      <td>{formatDate(sale.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
