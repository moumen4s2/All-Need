import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Heart, Star, Plus } from "lucide-react";

export const ProductCard = ({ product, index = 0 }) => {
  const { productName, money, addToCart, toggleWishlist, inWishlist, t } = useApp();
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative rounded-xl overflow-hidden bg-white aspect-[4/5] card-shadow">
          <img src={product.image} alt={productName(product)} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {product.best_seller && <span className="overline text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-full">{t.product.best}</span>}
            {product.new_arrival && <span className="overline text-[10px] bg-[var(--sky)] text-slate-900 px-2.5 py-1 rounded-full">{t.product.new}</span>}
            {discount > 0 && <span className="overline text-[10px] bg-rose-500 text-white px-2.5 py-1 rounded-full">-{discount}%</span>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-3 end-3 w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
            data-testid={`wishlist-toggle-${product.id}`}
            aria-label="wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-700"}`} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="absolute bottom-3 end-3 w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-800"
            data-testid={`quick-add-${product.id}`}
            aria-label="add to cart"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </Link>
      <div className="pt-4 px-1">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-slate-700">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.review_count})</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-medium text-[15px] text-slate-900 leading-snug line-clamp-2 hover:text-slate-600 transition-colors">{productName(product)}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-slate-900">{money(product.price)}</span>
          {product.old_price && <span className="text-sm text-slate-400 line-through">{money(product.old_price)}</span>}
        </div>
      </div>
    </motion.div>
  );
};
