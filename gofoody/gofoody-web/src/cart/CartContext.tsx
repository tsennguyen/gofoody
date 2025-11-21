import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartSummaryDto } from '../api/types';
import {
    addToCart,
    clearCart as clearCartApi,
    getCart,
    removeCartItem,
    updateCartItem,
  } from '../api/cartApi';
import { useAuth } from '../auth/AuthContext';

interface CartContextValue {
  cart: CartSummaryDto | null;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  addItem: (variantId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart().catch(() => undefined);
    } else {
      setCart(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (variantId: number, quantity: number) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để thêm vào giỏ.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await addToCart({ productVariantId: variantId, quantity });
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Không thêm được vào giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateCartItem(itemId, { quantity });
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Không cập nhật được giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await removeCartItem(itemId);
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Không xoá được sản phẩm khỏi giỏ.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clearCartApi();
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Không xoá được giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextValue = useMemo(
    () => ({
      cart,
      loading,
      error,
      loadCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [cart, loading, error],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
