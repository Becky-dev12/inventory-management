import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 5000
});

export async function fetchSummary() {
  const { data } = await api.get('/reports/summary');
  return data;
}

export async function fetchAnalytics() {
  const { data } = await api.get('/reports/analytics');
  return data;
}

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function createProduct(product) {
  const { data } = await api.post('/products', product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export async function adjustStock(id, payload) {
  const { data } = await api.patch(`/products/${id}/stock`, payload);
  return data;
}

export async function fetchSales() {
  const { data } = await api.get('/sales');
  return data;
}

export async function createSale(sale) {
  const { data } = await api.post('/sales', sale);
  return data;
}

export default api;
