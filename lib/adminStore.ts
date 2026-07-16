import { create } from 'zustand';
import { db, auth } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// ── Types ───────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  trackingId: string;
  courier: string;
  shippingAddress: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  sizes?: string[];
  features?: string[];
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  currency: string;
  adminPin: string;
  notifyOnOrder: boolean;
  notifyOnLowStock: boolean;
  lowStockThreshold: number;
}

interface AdminStore {
  // Auth state
  isAuthenticated: boolean;
  checkingAuth: boolean;
  adminUser: FirebaseUser | null;
  setAuthState: (isAuthenticated: boolean, adminUser: FirebaseUser | null) => void;
  setCheckingAuth: (checking: boolean) => void;

  // Real-time collections
  products: AdminProduct[];
  orders: Order[];
  customers: Customer[];
  settings: StoreSettings;

  // Real-time subscription methods
  subscribeProducts: () => () => void;
  subscribeOrders: () => () => void;
  subscribeCustomers: () => () => void;
  subscribeSettings: () => () => void;

  // Products CRUD
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders Actions
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  assignTracking: (orderId: string, trackingId: string, courier: string) => Promise<void>;

  // Settings Actions
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;

  // Helpers
  getOrderById: (id: string) => Order | undefined;
  getOrderByTracking: (trackingId: string) => Order | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerOrders: (customerId: string) => Order[];
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'LUXE',
  storeDescription: 'Premium Drop-Shoulder Tees — Designed in Pakistan',
  currency: 'PKR',
  adminPin: '1234',
  notifyOnOrder: true,
  notifyOnLowStock: true,
  lowStockThreshold: 10,
};

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Auth state
  isAuthenticated: false,
  checkingAuth: true,
  adminUser: null,
  setAuthState: (isAuthenticated, adminUser) => set({ isAuthenticated, adminUser }),
  setCheckingAuth: (checkingAuth) => set({ checkingAuth }),

  // Real-time collections
  products: [],
  orders: [],
  customers: [],
  settings: DEFAULT_SETTINGS,

  // Real-time subscriptions
  subscribeProducts: () => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products: AdminProduct[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name || '',
          price: Number(data.price || 0),
          image: data.image || '',
          category: data.category || '',
          description: data.description || '',
          stock: Number(data.stock || 0),
          status: data.status || 'draft',
          sizes: data.sizes || [],
          features: data.features || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      });
      set({ products });
    });
  },

  subscribeOrders: () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          customerId: data.uid || data.customerId || '',
          customerName: data.customerName || 'Anonymous',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          items: data.items || [],
          total: Number(data.total || 0),
          status: data.status || 'pending',
          trackingId: data.trackingId || '',
          courier: data.courier || '',
          shippingAddress: data.shippingAddress || '',
          city: data.city || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          statusHistory: data.statusHistory || [],
        });
      });
      set({ orders });
    });
  },

  subscribeCustomers: () => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const customers: Customer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          name: data.displayName || 'Unnamed User',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          totalOrders: Number(data.totalOrders || 0),
          totalSpent: Number(data.totalSpent || 0),
          joinedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || '',
        });
      });
      set({ customers });
    });
  },

  subscribeSettings: () => {
    const docRef = doc(db, 'settings', 'store');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          settings: {
            storeName: data.storeName || DEFAULT_SETTINGS.storeName,
            storeDescription: data.storeDescription || DEFAULT_SETTINGS.storeDescription,
            currency: data.currency || DEFAULT_SETTINGS.currency,
            adminPin: data.adminPin || DEFAULT_SETTINGS.adminPin,
            notifyOnOrder: data.notifyOnOrder ?? DEFAULT_SETTINGS.notifyOnOrder,
            notifyOnLowStock: data.notifyOnLowStock ?? DEFAULT_SETTINGS.notifyOnLowStock,
            lowStockThreshold: Number(data.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold),
          },
        });
      }
    });
  },

  // Products CRUD
  addProduct: async (product) => {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    });
  },

  updateProduct: async (id, updates) => {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
  },

  deleteProduct: async (id) => {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  },

  // Orders Actions
  updateOrderStatus: async (orderId, status, note) => {
    const docRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(docRef);
    if (!orderSnap.exists()) return;

    const currentHistory = orderSnap.data().statusHistory || [];
    const newHistoryItem = {
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${status}`,
    };

    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      statusHistory: [...currentHistory, newHistoryItem],
    });
  },

  assignTracking: async (orderId, trackingId, courier) => {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      trackingId,
      courier,
      updatedAt: serverTimestamp(),
    });
  },

  // Settings Actions
  updateSettings: async (updates) => {
    const docRef = doc(db, 'settings', 'store');
    await setDoc(docRef, updates, { merge: true });
  },

  // Helpers (searches cached list populated by subscriptions)
  getOrderById: (id) => get().orders.find((o) => o.id === id),
  getOrderByTracking: (trackingId) =>
    get().orders.find(
      (o) =>
        o.trackingId.toLowerCase() === trackingId.toLowerCase() ||
        o.id.toLowerCase() === trackingId.toLowerCase()
    ),
  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getCustomerOrders: (customerId) =>
    get().orders.filter((o) => o.customerId === customerId),
}));
