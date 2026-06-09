import axios from 'axios';

// --- CHOOSE ONE OF THE OPTIONS BELOW ---

// OPTION A: Hardcode your live backend URL (Easiest way to make it work right now)
// Make sure to replace this URL with your actual live Render or Railway backend link!
const API_BASE_URL = 'https://inventory-management-nh56.onrender.com'; 

// OPTION B: Smart fallback (Uncomment this later if you want it to automatically switch between local and production)
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================== REPORTS =====================
export const fetchSummary = async () => {
  const { data } = await api.get('/reports/summary');
  return data;
};

export const fetchAnalytics = async () => {
  const { data } = await api.get('/reports/analytics');
  return data;
};

// ===================== PRODUCTS =====================
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const createProduct = async (product) => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const adjustStock = async (id, payload) => {
  const { data } = await api.patch(`/products/${id}/stock`, payload);
  return data;
};

// ===================== SALES =====================
export const fetchSales = async () => {
  const { data } = await api.get('/sales');
  return data;
};

export const createSale = async (sale) => {
  const { data } = await api.post('/sales', sale);
  return data;
};

export default api;