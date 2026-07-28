import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { Star, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, productName, productDesc, money, addToCart, toggleWishlist, inWishlist, setCartOpen } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ author: "", rating: 5, comment: "" });

  const loadProduct = () => {
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      api.get(`/products?category=${r.data.category}`).then((rr) => setRelated(rr.data.filter((p) => p.id !== id).slice(0, 4)));
    }).catch(() => navigate("/shop"));
  };

  useEffect(() => { window.scrollTo(0, 0); setQty(1); loadProduct(); /* eslint-disable-next-line */ }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.author || !form.comment) return toast.error("Please fill all fields");
    await api.post(`/products/${id}/reviews`, form);
    toast.success("Thank you for your review!");
    setForm({ author: "", rating: 5, comment: "" });
    loadProduct();
  };

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">{t.common.loading}</div>;

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;
  const buyNow = () => { addToCart(product, qty); setCartOpen(false); navigate("/checkout"); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" data-testid="product-details-page">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
        <Link to="/" className="hover:text-slate-900">{t.nav.home}</Link><ChevronRight className="w-3 h-3" />
        <Link to={`/shop?category=${product.category_id}`} className="hover:text-slate-900 capitalize">{product.category_id}</Link><ChevronRight className="w-3 h-3" />
        <span className="text-slate-900">{productName(product)}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="rounded-3xl overflow-hidden bg-white card-shadow aspect-square">
          <img src={product.image} alt={productName(product)} className="w-full h-full object-cover" data-testid="product-main-image" />
        </div>

        <div className="lg:py-4">
          <div className="flex items-center gap-2 mb-3">
            {product.best_seller && <span className="overline text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-full">{t.product.best}</span>}
            {product.new_arrival && <span className="overline text-[10px] bg-[var(--sky)] text-slate-900 px-2.5 py-1 rounded-full">{t.product.new}</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{productName(product)}</h1>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-slate-400">· {product.review_count} {t.product.reviews}</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold">{money(product.price)}</span>
            {product.old_price && <span className="text-lg text-slate-400 line-through">{money(product.old_price)}</span>}
            {discount > 0 && <span className="text-sm font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">-{discount}% {t.product.off}</span>}
          </div>

          <p className="text-slate-600 leading-relaxed mb-8">{productDesc(product)}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full" data-testid="qty-decrease"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-medium" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full" data-testid="qty-increase"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="text-sm text-emerald-600 font-medium">● {t.product.inStock}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={() => addToCart(product, qty)} className="flex-1 bg-slate-900 text-white rounded-full py-4 font-semibold hover:bg-slate-800 transition-colors" data-testid="add-to-cart-btn">{t.product.addCart}</button>
            <button onClick={buyNow} className="flex-1 bg-[var(--sand)] text-slate-900 rounded-full py-4 font-semibold hover:bg-[#ded7c2] transition-colors" data-testid="buy-now-btn">{t.product.buyNow}</button>
            <button onClick={() => toggleWishlist(product)} className="w-14 h-14 shrink-0 border rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors" data-testid="wishlist-detail-btn">
              <Heart className={`w-5 h-5 ${inWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""}`} strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t pt-6">
            {[[ShieldCheck, t.why.safe[0]], [Truck, t.why.delivery[0]], [RotateCcw, t.why.returns[0]]].map(([Icon, label], i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <Icon className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 lg:mt-24">
        <Tabs defaultValue="desc">
          <TabsList className="bg-slate-100 rounded-full p-1">
            <TabsTrigger value="desc" className="rounded-full" data-testid="tab-desc">{t.product.desc}</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full" data-testid="tab-reviews">{t.product.reviews} ({product.review_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="pt-8 max-w-3xl">
            <p className="text-slate-600 leading-relaxed text-lg">{productDesc(product)}</p>
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                {(product.reviews || []).length === 0 && <p className="text-slate-400">No reviews yet. Be the first!</p>}
                {(product.reviews || []).map((r) => (
                  <div key={r.id} className="border-b pb-5" data-testid={`review-item-${r.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{r.author}</span>
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                    </div>
                    <p className="text-sm text-slate-600">{r.comment}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitReview} className="bg-slate-50 rounded-2xl p-6 space-y-4 h-fit" data-testid="review-form">
                <h4 className="font-display font-semibold text-lg">{t.product.writeReview}</h4>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder={t.product.yourName} className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" data-testid="review-author" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button type="button" key={i} onClick={() => setForm({ ...form, rating: i + 1 })} data-testid={`review-star-${i + 1}`}>
                      <Star className={`w-6 h-6 ${i < form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder={t.product.yourReview} rows={4} className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 resize-none" data-testid="review-comment" />
                <button type="submit" className="w-full bg-slate-900 text-white rounded-full py-3 font-semibold hover:bg-slate-800 transition-colors" data-testid="review-submit">{t.product.submit}</button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">{t.product.related}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
};
