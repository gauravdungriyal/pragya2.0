import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { CartOtpModal } from '../components/CartOtpModal';

export interface CartItem {
  id: number | string;
  packageID?: string;
  package_id?: number | string;
  bundle_id?: number | string;
  package_ids?: (number | string)[];
  event_id?: number | string;
  schedule_id?: number | string;
  title: string;
  price: number;
  originalPrice?: number;
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
      const authSaved = localStorage.getItem('pragya_auth_v1');
      if (!authSaved) return [];
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

  // Keep cart empty if user is not logged in; save items only when logged in
  useEffect(() => {
    if (!user) {
      setItems([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [user, items]);

  const [toast, setToast] = useState<{ title: string; subtitle?: string; visible: boolean } | null>(null);

  const showToast = useCallback((title: string, subtitle?: string) => {
    setToast({ title, subtitle, visible: true });
  }, []);

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible]);

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
        // Bug 10 fix: spread the object to avoid direct mutation of the prev state reference
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity };
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });

    // Bug 22 fix: use item's currency field if provided, otherwise default to HK$
    const currencyLabel = (item as any).currency === 'INR' ? '₹' : 'HK$';
    showToast(item.title, `${currencyLabel} ${item.price.toLocaleString()}`);
  }, [user, showToast]);

  const handleOtpSuccess = () => {
    if (pendingItem) {
      const { item, quantity } = pendingItem;
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => String(i.id) === String(item.id));
        if (existingIdx > -1) {
          const updated = [...prev];
          // Bug 10 fix: spread the object to avoid direct mutation of the prev state reference
          updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity };
          return updated;
        }
        return [...prev, { ...item, quantity }];
      });
      const currencyLabel = (item as any).currency === 'INR' ? '₹' : 'HK$';
      showToast(item.title, `${currencyLabel} ${item.price.toLocaleString()}`);
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

      {/* Animated Floating "Added to Cart" Toast Banner */}
      {toast && toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: 96,
            right: 24,
            zIndex: 99999,
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #D9A726',
            borderRadius: '16px',
            padding: '14px 20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), 0 0 20px rgba(217, 167, 38, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            maxWidth: 380,
            animation: 'toastSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 181, 148, 0.18)',
              border: '1px solid #00B594',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B594" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D9A726', marginBottom: 2 }}>
              Added to Cart!
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#F5EFE5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {toast.title}
            </div>
            {toast.subtitle && (
              <div style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 600, marginTop: 1 }}>
                {toast.subtitle}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setToast((prev) => (prev ? { ...prev, visible: false } : null));
              window.dispatchEvent(new CustomEvent('navigate-to-cart'));
            }}
            style={{
              backgroundColor: '#944426',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            View Cart
          </button>

          {/* Auto-dismiss progress timer bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              backgroundColor: '#D9A726',
              animation: 'toastProgress 3.5s linear forwards',
            }}
          />

          <style>{`
            @keyframes toastSlideIn {
              0% { transform: translate3d(40px, -20px, 0) scale(0.92); opacity: 0; }
              70% { transform: translate3d(-4px, 2px, 0) scale(1.02); opacity: 1; }
              100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
            }
            @keyframes toastProgress {
              0% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
