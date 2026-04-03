import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const cartKey = user ? `eventmitra_cart_${user._id}` : "eventmitra_cart_guest";

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // Clear cart when user changes
  useEffect(() => {
    if (!user) {
      setCart([]);
      setProvider(null);
    }
  }, [user]);

  const addToCart = (service, providerInfo) => {
    // If adding from a different provider, clear cart first
    if (provider && provider._id !== providerInfo._id) {
      setCart([{
        ...service,
        provider: providerInfo
      }]);
      setProvider(providerInfo);
    } else {
      setProvider(providerInfo);
      setCart(prev => {
        const exists = prev.find(item => item._id === service._id);
        if (exists) {
          return prev;
        }
        return [...prev, { ...service, provider: providerInfo }];
      });
    }
  };

  const removeFromCart = (serviceId) => {
    setCart(prev => {
      const newCart = prev.filter(item => item._id !== serviceId);
      if (newCart.length === 0) {
        setProvider(null);
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setProvider(null);
  };

  const isInCart = (serviceId) => {
    return cart.some(item => item._id === serviceId);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.startingPrice || 0), 0);
  };

  const getCartCount = () => {
    return cart.length;
  };

  return (
    <CartContext.Provider value={{
      cart,
      provider,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
