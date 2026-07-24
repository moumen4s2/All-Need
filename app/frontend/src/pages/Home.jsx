import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, ArrowLeft, Award, ShieldCheck, Truck, CreditCard, RotateCcw, Headphones, Star, Quote } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1561525140-c2a4cc68e4bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

const WHY_ICONS = { quality: Award, safe: ShieldCheck, delivery: Truck, payments: CreditCard, returns: RotateCcw, support: Headphones };

const REVIEWS = [
  { name: "Fatima A.", city: "Dubai", rating: 5, text: "The quality is exceptional and delivery was so fast. My go-to store for everything baby!", ar: "الجودة استثنائية والتوصيل سريع جداً. متجري المفضل لكل ما يخص الأطفال!" },
  { name: "Sarah M.", city: "Abu Dhabi", rating: 5, text: "Beautiful packaging and genuinely premium products. You can feel the care in every detail.", ar: "تغليف جميل ومنتجات فاخرة حقاً. تشعر بالعناية في كل التفاصيل." },
  { name: "Ahmed K.", city: "Sharjah", rating: 5, text: "Bought the stroller and car seat — both feel super safe and well made. Highly recommend.", ar: "اشتريت العربة ومقعد السيارة — كلاهما آمن ومصنوع بإتقان. أنصح بشدة." },
];

export const Home = () => {
  const { t, lang, dir } = useApp();
  const [categories, setCategories] = useState([]);
  const [best, setBest] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
    api.get("/products?best_seller=true").then((r) => setBest(r.data.slice(0, 4)));
    api.get("/products?new_arrival=true").then((r) => setArrivals(r.data.slice(0, 4)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
          <div className="relative rounded-3xl overflow-hidden min-h-[520px] lg:min-h-[600px] flex items-center">
            <img src={HERO} alt="Happy family" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent lg:bg-gradient-to-e lg:from-black/70 lg:via-black/40 lg:to-transparent" style={{ background: dir === "rtl" ? "linear-gradient(to left, rgba(0,0,0,0.72), rgba(0,0,0,0.35), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.72), rgba(0,0,0,0.35), transparent)" }} />
            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="overline text-[11px] text-white/90 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full inline-block mb-6">{t.hero.badge}</motion.span>
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-5">{t.hero.title}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-lg text-white/85 leading-relaxed mb-8 max-w-lg">{t.hero.subtitle}</motion.p>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-wrap gap-3">
                <Link to="/shop" className="group bg-white text-slate-950 rounded-full px-7 py-4 font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors" data-testid="hero-shop-now">{t.hero.cta} <Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></Link>
                <Link to="/categories" className="bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full px-7 py-4 font-semibold hover:bg-white/20 transition-colors">{t.hero.cta2}</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SectionHead title={t.sections.featured} sub={t.sections.featuredSub} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((c, i) => (
            <Link key={c.slug} to={`/shop?category=${c.slug}`} data-testid={`category-card-${c.slug}`}
              className={`group relative rounded-2xl overflow-hidden ${i === 0 ? "md:col-span-2 md:row-span-2" : ""} ${i === 3 ? "md:col-span-2" : ""}`}
              style={{ minHeight: i === 0 ? "100%" : "200px" }}>
              <img src={c.image} alt={c[lang] || c.en} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-5 min-h-[200px]">
                <h3 className="font-display font-semibold text-lg text-white">{lang === "ar" ? c.ar : c.en}</h3>
                <span className="text-xs text-white/80">{c.count} {t.shop.results}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-[var(--sand-soft)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <SectionHead title={t.sections.best} sub={t.sections.bestSub} link="/shop?best_seller=true" linkLabel={t.sections.viewAll} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
            {best.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SectionHead title={t.sections.new} sub={t.sections.newSub} link="/shop?new_arrival=true" linkLabel={t.sections.viewAll} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
          {arrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* WHY */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center mb-14">
            <span className="overline text-[11px] text-[var(--sky)]">{t.sections.whySub}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">{t.sections.why}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(t.why).map(([key, [title, desc]], i) => {
              const Icon = WHY_ICONS[key];
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors" data-testid={`why-${key}`}>
                  <div className="w-12 h-12 rounded-full bg-[var(--sky)] flex items-center justify-center mb-5"><Icon className="w-6 h-6 text-slate-950" strokeWidth={1.5} /></div>
                  <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SectionHead title={t.sections.reviews} sub={t.sections.reviewsSub} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-7 card-shadow relative" data-testid={`review-${i}`}>
              <Quote className="w-8 h-8 text-[var(--sand)] mb-4" />
              <div className="flex gap-0.5 mb-3">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-slate-700 leading-relaxed mb-5">"{lang === "ar" ? r.ar : r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--sand)] flex items-center justify-center font-display font-semibold">{r.name[0]}</div>
                <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-slate-500">{r.city}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <NewsletterBand />
    </div>
  );
};

const SectionHead = ({ title, sub, link, linkLabel }) => {
  const { dir } = useApp();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <div className="flex items-end justify-between mb-10 lg:mb-14">
      <div>
        <span className="overline text-[11px] text-slate-500">{sub}</span>
        <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-slate-950">{title}</h2>
      </div>
      {link && <Link to={link} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all">{linkLabel} <Arrow className="w-4 h-4" /></Link>}
    </div>
  );
};

const NewsletterBand = () => {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const submit = async (e) => { e.preventDefault(); try { await api.post("/newsletter", { email }); const { toast } = await import("sonner"); toast.success(t.newsletter.done); setEmail(""); } catch {} };
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="rounded-3xl bg-[var(--sky-soft)] p-10 sm:p-16 text-center relative overflow-hidden" data-testid="newsletter-band">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.newsletter.title}</h2>
          <p className="text-slate-600 mb-8">{t.newsletter.sub}</p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder={t.newsletter.placeholder} className="flex-1 bg-white rounded-full px-5 py-3.5 outline-none focus:ring-2 focus:ring-slate-900" data-testid="newsletter-input" />
            <button type="submit" className="bg-slate-900 text-white rounded-full px-7 py-3.5 font-semibold hover:bg-slate-800 transition-colors" data-testid="newsletter-submit">{t.newsletter.btn}</button>
          </form>
        </div>
      </div>
    </section>
  );
};
