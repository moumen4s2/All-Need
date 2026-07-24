import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Award, ShieldCheck, Heart } from "lucide-react";

const ABOUT_IMG = "https://images.pexels.com/photos/18036792/pexels-photo-18036792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const About = () => {
  const { t, lang } = useApp();
  const content = {
    en: {
      badge: "Our Story", title: "Made for the moments that matter",
      p1: "AllNeeds was born in the UAE from a simple belief: parenting should feel joyful, not overwhelming. We travel the world to source the safest, most beautiful baby products — then bring them home to families across the Emirates.",
      p2: "Every product in our collection is chosen with obsessive care. From BPA-free feeding sets to cabin-approved strollers, we test everything against the standards we'd demand for our own children.",
      stats: [["10K+", "Happy families"], ["500+", "Curated products"], ["7", "Emirates served"], ["4.9★", "Average rating"]],
      values: [[Award, "Uncompromising Quality", "We partner only with trusted global brands and rigorously vet every item."], [ShieldCheck, "Safety First", "Non-toxic, certified materials — because nothing matters more."], [Heart, "Made with Care", "Thoughtful details, beautiful design, and service that treats you like family."]],
    },
    ar: {
      badge: "قصتنا", title: "صُنع للحظات التي تهم",
      p1: "وُلدت AllNeeds في الإمارات من إيمان بسيط: يجب أن تكون الأبوة مبهجة لا مرهقة. نسافر حول العالم لاختيار أأمن وأجمل منتجات الأطفال — ثم نجلبها للعائلات في جميع أنحاء الإمارات.",
      p2: "يتم اختيار كل منتج في مجموعتنا بعناية فائقة. من أطقم التغذية الخالية من BPA إلى العربات المعتمدة للطائرة، نختبر كل شيء وفق المعايير التي نطلبها لأطفالنا.",
      stats: [["+10 آلاف", "عائلة سعيدة"], ["+500", "منتج مختار"], ["7", "إمارات"], ["4.9★", "متوسط التقييم"]],
      values: [[Award, "جودة لا تقبل المساومة", "نتشارك فقط مع علامات عالمية موثوقة ونفحص كل منتج بدقة."], [ShieldCheck, "الأمان أولاً", "مواد غير سامة ومعتمدة — لأن لا شيء أهم."], [Heart, "صُنع بحب", "تفاصيل مدروسة وتصميم جميل وخدمة تعاملك كعائلة."]],
    },
  }[lang];

  return (
    <div data-testid="about-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="overline text-[11px] text-slate-500">{content.badge}</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-6 leading-tight">{content.title}</h1>
            <p className="text-slate-600 leading-relaxed mb-4">{content.p1}</p>
            <p className="text-slate-600 leading-relaxed mb-8">{content.p2}</p>
            <Link to="/shop" className="inline-block bg-slate-900 text-white rounded-full px-8 py-3.5 font-semibold hover:bg-slate-800 transition-colors">{t.hero.cta}</Link>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/3] card-shadow"><img src={ABOUT_IMG} alt="Nursery" className="w-full h-full object-cover" /></div>
        </div>
      </div>

      <div className="bg-[var(--sand-soft)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {content.stats.map(([n, l], i) => (
            <div key={i}><p className="font-display font-bold text-4xl text-slate-900">{n}</p><p className="text-sm text-slate-600 mt-1">{l}</p></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {content.values.map(([Icon, title, desc], i) => (
            <div key={i} className="bg-white rounded-2xl p-8 card-shadow">
              <div className="w-12 h-12 rounded-full bg-[var(--sky)] flex items-center justify-center mb-5"><Icon className="w-6 h-6 text-slate-900" strokeWidth={1.5} /></div>
              <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
