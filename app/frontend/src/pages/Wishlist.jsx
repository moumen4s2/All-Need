import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export const Wishlist = () => {
  const { t, wishlist, toggleWishlist, addToCart, productName, money } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[60vh]" data-testid="wishlist-page">
      <h1 className="text-4xl sm:text-5xl font-bold mb-10">{t.wishlist.title}</h1>
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center"><Heart className="w-8 h-8 text-slate-400" strokeWidth={1.5} /></div>
          <p className="font-display text-lg font-medium">{t.wishlist.empty}</p>
          <p className="text-sm text-slate-500">{t.wishlist.emptySub}</p>
          <Link to="/shop" className="bg-slate-900 text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors mt-2">{t.cart.start}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((p) => (
            <div key={p.id} className="flex gap-4 bg-white rounded-2xl p-4 card-shadow" data-testid={`wishlist-item-${p.id}`}>
              <Link to={`/product/${p.id}`}><img src={p.image} alt="" className="w-24 h-28 rounded-xl object-cover" /></Link>
              <div className="flex-1 flex flex-col">
                <Link to={`/product/${p.id}`}><h3 className="font-medium leading-snug line-clamp-2 hover:text-slate-600">{productName(p)}</h3></Link>
                <span className="font-semibold mt-1">{money(p.price)}</span>
                <div className="mt-auto flex gap-2 pt-3">
                  <button onClick={() => addToCart(p)} className="flex items-center gap-1.5 bg-slate-900 text-white rounded-full px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors" data-testid={`wishlist-add-${p.id}`}><ShoppingBag className="w-3.5 h-3.5" /> {t.wishlist.move}</button>
                  <button onClick={() => toggleWishlist(p)} className="w-9 h-9 border rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors" data-testid={`wishlist-remove-${p.id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
