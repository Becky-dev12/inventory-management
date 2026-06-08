import { useEffect, useState } from 'react';

const initialState = {
  name: '',
  sku: '',
  category: '',
  supplier: '',
  price: '',
  cost: '',
  stock: '',
  reorderLevel: '',
  description: '',
  isActive: true
};

export default function ProductForm({ product, onSubmit, onCancel, isSaving }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(product || initialState);
  }, [product]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel)
    });
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{product ? 'Edit product' : 'New product'}</h2>
        <label className="switch">
          <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
          <span>Active</span>
        </label>
      </div>

      <label>
        Product name
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label>
        SKU
        <input name="sku" value={form.sku} onChange={handleChange} required />
      </label>
      <label>
        Category
        <input name="category" value={form.category} onChange={handleChange} required />
      </label>
      <label>
        Supplier
        <input name="supplier" value={form.supplier} onChange={handleChange} />
      </label>
      <label>
        Price
        <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
      </label>
      <label>
        Cost
        <input name="cost" type="number" min="0" step="0.01" value={form.cost} onChange={handleChange} required />
      </label>
      <label>
        Stock
        <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
      </label>
      <label>
        Reorder level
        <input
          name="reorderLevel"
          type="number"
          min="0"
          value={form.reorderLevel}
          onChange={handleChange}
          required
        />
      </label>
      <label className="span-2">
        Description
        <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
      </label>

      <div className="form-actions span-2">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
