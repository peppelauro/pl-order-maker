import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Agent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface PointOfSale {
  id: string;
  customer_id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
}

interface OrderProduct {
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id?: string;
  agent_id: string;
  agent_name: string;
  customer_id: string;
  customer_name: string;
  pos_id: string;
  pos_name: string;
  products: OrderProduct[];
  delivery_date: string;
  total_amount: number;
  status: 'pending' | 'synced' | 'completed';
  created_at?: string;
  synced_at?: string;
}

interface AppState {
  // Auth
  agent: Agent | null;
  isLoggedIn: boolean;
  
  // Data
  customers: Customer[];
  pointsOfSale: PointOfSale[];
  products: Product[];
  orders: Order[];
  
  // Sync status
  lastSyncTime: string | null;
  isSyncing: boolean;
  
  // Actions
  setAgent: (agent: Agent | null) => void;
  logout: () => void;
  
  // Data actions
  setCustomers: (customers: Customer[]) => void;
  setPointsOfSale: (pos: PointOfSale[]) => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  
  // Sync actions
  setSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: string) => void;
  
  // Load from storage
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  agent: null,
  isLoggedIn: false,
  customers: [],
  pointsOfSale: [],
  products: [],
  orders: [],
  lastSyncTime: null,
  isSyncing: false,
  
  // Auth actions
  setAgent: (agent) => {
    set({ agent, isLoggedIn: !!agent });
    get().saveToStorage();
  },
  
  logout: () => {
    set({ 
      agent: null, 
      isLoggedIn: false,
      customers: [],
      pointsOfSale: [],
      products: [],
      orders: [],
      lastSyncTime: null
    });
    AsyncStorage.clear();
  },
  
  // Data actions
  setCustomers: (customers) => {
    set({ customers });
    get().saveToStorage();
  },
  
  setPointsOfSale: (pointsOfSale) => {
    set({ pointsOfSale });
    get().saveToStorage();
  },
  
  setProducts: (products) => {
    set({ products });
    get().saveToStorage();
  },
  
  setOrders: (orders) => {
    set({ orders });
    get().saveToStorage();
  },
  
  addOrder: (order) => {
    set((state) => ({ orders: [order, ...state.orders] }));
    get().saveToStorage();
  },
  
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));
    get().saveToStorage();
  },
  
  // Sync actions
  setSyncing: (isSyncing) => set({ isSyncing }),
  
  setLastSyncTime: (lastSyncTime) => {
    set({ lastSyncTime });
    get().saveToStorage();
  },
  
  // Storage actions
  loadFromStorage: async () => {
    try {
      const [agentStr, customersStr, posStr, productsStr, ordersStr, syncTimeStr] = await Promise.all([
        AsyncStorage.getItem('agent'),
        AsyncStorage.getItem('customers'),
        AsyncStorage.getItem('pointsOfSale'),
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('orders'),
        AsyncStorage.getItem('lastSyncTime'),
      ]);
      
      if (agentStr) {
        const agent = JSON.parse(agentStr);
        set({ agent, isLoggedIn: true });
      }
      if (customersStr) set({ customers: JSON.parse(customersStr) });
      if (posStr) set({ pointsOfSale: JSON.parse(posStr) });
      if (productsStr) set({ products: JSON.parse(productsStr) });
      if (ordersStr) set({ orders: JSON.parse(ordersStr) });
      if (syncTimeStr) set({ lastSyncTime: syncTimeStr });
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  },
  
  saveToStorage: async () => {
    try {
      const state = get();
      await Promise.all([
        AsyncStorage.setItem('agent', JSON.stringify(state.agent)),
        AsyncStorage.setItem('customers', JSON.stringify(state.customers)),
        AsyncStorage.setItem('pointsOfSale', JSON.stringify(state.pointsOfSale)),
        AsyncStorage.setItem('products', JSON.stringify(state.products)),
        AsyncStorage.setItem('orders', JSON.stringify(state.orders)),
        state.lastSyncTime && AsyncStorage.setItem('lastSyncTime', state.lastSyncTime),
      ]);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
}));
