import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { CartOtpModal } from '../components/CartOtpModal';

export interface CartItem {
  id: number | string;
  packageID?: string;
  title: string;
  price: number;
  category?: string;
  type?: string;
  coverImage?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const STORAGE_KEY = 'pragyayog_cart_items_v1';

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // OTP Verification before adding to cart for unauthenticated users
  const [pendingItem, setPendingItem] = useState<{ item: Omit<CartItem, 'quantity'>; quantity: number } | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!user) {
      // Require OTP verification & guest login first before adding anything to cart!
      setPendingItem({ item, quantity });
      setOtpModalOpen(true);
      return;
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => String(i.id) === String(item.id));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
  }, [user]);

  const handleOtpSuccess = () => {
    if (pendingItem) {
      const { item, quantity } = pendingItem;
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => String(i.id) === String(item.id));
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        }
        return [...prev, { ...item, quantity }];
      });
      setPendingItem(null);
    }
    setOtpModalOpen(false);
  };

  const removeFromCart = useCallback((id: number | string) => {
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  const updateQuantity = useCallback((id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}

      {/* Mandatory OTP & Guest Verification Modal before adding item to cart */}
      <CartOtpModal
        isOpen={otpModalOpen}
        onClose={() => { setOtpModalOpen(false); setPendingItem(null); }}
        item={pendingItem?.item}
        onSuccess={handleOtpSuccess}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
