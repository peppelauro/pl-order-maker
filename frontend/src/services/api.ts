import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentAPI = {
  login: async (name: string, password: string) => {
    const response = await api.post('/agents/login', { name, password });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/agents');
    return response.data;
  },
};

export const customerAPI = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
};

export const posAPI = {
  getAll: async (customerId?: string) => {
    const url = customerId ? `/points-of-sale?customer_id=${customerId}` : '/points-of-sale';
    const response = await api.get(url);
    return response.data;
  },
};

export const productAPI = {
  getAll: async (search?: string) => {
    const url = search ? `/products?search=${search}` : '/products';
    const response = await api.get(url);
    return response.data;
  },
  getByBarcode: async (barcode: string) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },
};

export const orderAPI = {
  create: async (order: any) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  getAll: async (agentId?: string) => {
    const url = agentId ? `/orders?agent_id=${agentId}` : '/orders';
    const response = await api.get(url);
    return response.data;
  },
};

export const seedData = async () => {
  const response = await api.post('/seed-data');
  return response.data;
};

export default api;
