import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "@/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [cart, setCart] = useState(() => load("cart", []));
  const [wishlist, setWishlist] = useState(() => load("wishlist", []));
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const t = translations[lang];
  const dir = t.dir;

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang, dir]);

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const checkAuth = useCallback(async () => {
    if (window.location.hash?.includes("session_id=")) return;
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch { setUser(null); }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
    toast.success("Signed out");
  };

  const productName = (p) => (lang === "ar" && p.name_ar ? p.name_ar : p.name);
  const productDesc = (p) => (lang === "ar" && p.description_ar ? p.description_ar : p.description);
  const money = (v) => `${t.common.currency} ${Number(v).toLocaleString()}`;

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, quantity: qty }];
    });
    toast.success(`${productName(product)} ${lang === "ar" ? "أُضيف للسلة" : "added to cart"}`);
    setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((i) => i.id === product.id)) {
        toast(lang === "ar" ? "أُزيل من المفضلة" : "Removed from wishlist");
        return prev.filter((i) => i.id !== product.id);
      }
      toast.success(lang === "ar" ? "أُضيف للمفضلة" : "Added to wishlist");
      return [...prev, product];
    });
  };

  const inWishlist = (id) => wishlist.some((i) => i.id === id);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <AppContext.Provider value={{
      lang, setLang, t, dir, cart, wishlist, user, setUser, checkAuth, login, logout,
      cartOpen, setCartOpen, addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, inWishlist, cartCount, cartSubtotal, productName, productDesc, money,
    }}>
      {children}
    </AppContext.Provider>
  );
};
