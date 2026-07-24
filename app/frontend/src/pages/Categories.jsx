import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const Categories = () => {
  const { t, lang, dir } = useApp();
  const [categories, setCategories] = useState([]);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" data-testid="categories-page">
      <div className="mb-12 max-w-2xl">
        <span className="overline text-[11px] text-slate-500">{t.sections.featuredSub}</span>
        <h1 className="text-4xl sm:text-5xl font-bold mt-2">{t.nav.categories}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((c, i) => (
          <motion.div key={c.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}>
            <Link to={`/shop?category=${c.slug}`} className="group relative block rounded-3xl overflow-hidden h-72" data-testid={`categories-card-${c.slug}`}>
              <img src={c.image} alt={c.en} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <h3 className="font-display font-bold text-2xl text-white mb-1">{lang === "ar" ? c.ar : c.en}</h3>
                <div className="flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                  {c.count} {t.shop.results} <Arrow className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
