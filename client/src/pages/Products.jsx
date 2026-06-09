import React from 'react';
import { Minus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ProductForm from '../components/ProductForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { adjustStock, createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/api.js';
import { currency } from '../utils/formatters.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadProducts() {
    const data = await fetchProducts({ search });
    setProducts(data);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts().catch((err) => setError(err.response?.data?.message || err.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = useMemo(() => [...new Set(products.map((product) => product.category))], [products]);

  async function handleSubmit(payload) {
    setIsSaving(true);
    setError('');
    try {
      if (editing) {
        await updateProduct(editing._id, payload);
      } else {
        await createProduct(payload);
      }
      setEditing(null);
      setIsFormOpen(false);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStock(product, type) {
    const quantity = Number(window.prompt(`${type === 'increase' ? 'Add to' : 'Remove from'} stock`, '1'));
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    await adjustStock(product._id, { type, quantity });
    await loadProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await deleteProduct(product._id);
    await loadProducts();
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage Ethiopian product pricing, suppliers, and stock levels in birr.</p>
        </div>
        <button
          className="button primary"
          onClick={() => {
            setEditing(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} />
          Add product
        </button>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      {isFormOpen ? (
        <ProductForm
          product={editing}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditing(null);
            setIsFormOpen(false);
          }}
        />
      ) : null}

      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, SKU, or supplier" />
          </label>
          <div className="chips">
            {categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState title="No products found" message="Add products or clear the current search." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <strong>{product.name}</strong>
                      <small>{product.supplier || 'No supplier'}</small>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{currency.format(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <StatusBadge status={product.status} />
                    </td>
                    <td>
                      <div className="icon-actions">
                        <button title="Increase stock" onClick={() => handleStock(product, 'increase')}>
                          <Plus size={16} />
                        </button>
                        <button title="Decrease stock" onClick={() => handleStock(product, 'decrease')}>
                          <Minus size={16} />
                        </button>
                        <button
                          title="Edit product"
                          onClick={() => {
                            setEditing(product);
                            setIsFormOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button title="Delete product" onClick={() => handleDelete(product)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
