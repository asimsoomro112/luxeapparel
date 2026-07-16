import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  images?: string[];
  sizes?: string[];
  features?: string[];
  selectedSize?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  addItemWithQuantity: (product: Product, quantity: number) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (product) => {
        get().addItemWithQuantity(product, 1);
      },
      addItemWithQuantity: (product, quantity) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.id === product.id && item.selectedSize === product.selectedSize
        );
        const addQty = quantity <= 0 ? 1 : quantity;
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id && item.selectedSize === product.selectedSize
                ? { ...item, quantity: item.quantity + addQty }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: addQty }] });
        }
      },
      removeItem: (productId, selectedSize) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === productId && item.selectedSize === selectedSize)
          ),
        });
      },
      updateQuantity: (productId, quantity, selectedSize) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'luxe-cart-v2', // renamed key to discard old stale data (had isOpen persisted)
      partialize: (state) => ({
        items: state.items,
        // isOpen intentionally NOT persisted — always starts as false
      }),
    }
  )
);
