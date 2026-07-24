import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

export const Shop = () => {
  const { t, lang } = useApp();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState([0, 1200]);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "featured";
  const best = params.get("best_seller");
  const newA = params.get("new_arrival");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (search) q.set("search", search);
    if (sort && sort !== "featured") q.set("sort", sort);
    if (best) q.set("best_seller", "true");
    if (newA) q.set("new_arrival", "true");
    q.set("min_price", price[0]); q.set("max_price", price[1]);
    const res = await api.get(`/products?${q.toString()}`);
    setProducts(res.data);
    setLoading(false);
  }, [category, search, sort, best, newA, price]);

  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const update = (key, value) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    setParams(p);
  };

  const clearFilters = () => { setParams({}); setPrice([0, 1200]); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" data-testid="shop-page">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold">{t.shop.title}</h1>
        {search && <p className="text-slate-500 mt-2">"{search}"</p>}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Filters */}
        <aside className="space-y-8">
          <div className="flex items-center gap-2 text-slate-900 font-display font-semibold text-lg"><SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} /> {t.shop.filters}</div>

          <div>
            <h4 className="overline text-[11px] text-slate-500 mb-4">{t.shop.category}</h4>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button onClick={() => update("category", "")} className={`text-start text-sm py-2 px-4 rounded-full lg:rounded-lg transition-colors ${!category ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200"}`} data-testid="filter-cat-all">{t.shop.all}</button>
              {categories.map((c) => (
                <button key={c.slug} onClick={() => update("category", c.slug)} className={`text-start text-sm py-2 px-4 rounded-full lg:rounded-lg transition-colors ${category === c.slug ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200"}`} data-testid={`filter-cat-${c.slug}`}>{lang === "ar" ? c.ar : c.en}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="overline text-[11px] text-slate-500 mb-4">{t.shop.priceRange}</h4>
            <Slider min={0} max={1200} step={25} value={price} onValueChange={setPrice} className="my-4" data-testid="price-slider" />
            <div className="flex justify-between text-sm text-slate-600"><span>{t.common.currency} {price[0]}</span><span>{t.common.currency} {price[1]}</span></div>
          </div>

          <button onClick={clearFilters} className="text-sm text-slate-500 underline hover:text-slate-900" data-testid="clear-filters">{t.shop.clear}</button>
        </aside>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-slate-500">{products.length} {t.shop.results}</span>
            <Select value={sort} onValueChange={(v) => update("sort", v === "featured" ? "" : v)}>
              <SelectTrigger className="w-48 rounded-full" data-testid="sort-select"><SelectValue placeholder={t.shop.sortBy} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t.shop.featured}</SelectItem>
                <SelectItem value="price_asc">{t.shop.priceLow}</SelectItem>
                <SelectItem value="price_desc">{t.shop.priceHigh}</SelectItem>
                <SelectItem value="rating">{t.shop.topRated}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-slate-500" data-testid="shop-empty">{t.shop.empty}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8" data-testid="products-grid">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
